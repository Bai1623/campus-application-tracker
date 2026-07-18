param(
  [string]$InputApk,
  [string]$OutputApk,
  [Parameter(Mandatory = $true)]
  [string]$BuildToolsDir,
  [string]$AndroidJar,
  [string]$Keystore = (Join-Path $env:USERPROFILE ".android\debug.keystore"),
  [string]$KeyAlias = "androiddebugkey",
  [string]$StorePassword = "android",
  [string]$KeyPassword = "android"
)

$ErrorActionPreference = "Stop"

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$versionFile = Join-Path $projectRoot "version.properties"
$manifestFile = Join-Path $projectRoot "android-wrapper\AndroidManifest.xml"
$resourceDirectory = Join-Path $projectRoot "android-wrapper\res"

if (-not (Test-Path -LiteralPath $versionFile -PathType Leaf)) {
  throw "Version file not found: $versionFile"
}

$version = Get-Content -LiteralPath $versionFile -Raw | ConvertFrom-StringData
$versionName = $version.VERSION_NAME
$versionCode = $version.VERSION_CODE
$minSdk = $version.MIN_SDK
$targetSdk = $version.TARGET_SDK

if ($versionName -notmatch '^\d+\.\d+\.\d+$') {
  throw "Invalid VERSION_NAME in version.properties: $versionName"
}
foreach ($numericValue in @($versionCode, $minSdk, $targetSdk)) {
  if ($numericValue -notmatch '^\d+$') {
    throw "Version code and SDK values must be integers."
  }
}

$appScript = Get-Content -LiteralPath (Join-Path $projectRoot "app.js") -Raw
$indexHtml = Get-Content -LiteralPath (Join-Path $projectRoot "index.html") -Raw
if ($appScript -notmatch ('const APP_VERSION = "' + [regex]::Escape($versionName) + '";')) {
  throw "app.js APP_VERSION does not match VERSION_NAME $versionName."
}
if ($indexHtml -notmatch ('v' + [regex]::Escape($versionName) + '\s')) {
  throw "index.html version text does not match VERSION_NAME $versionName."
}

if ([string]::IsNullOrWhiteSpace($InputApk)) {
  $releaseDirectory = Join-Path $projectRoot "releases"
  $releaseApks = @(Get-ChildItem -LiteralPath $releaseDirectory -Filter "*.apk" -File)
  if ($releaseApks.Count -ne 1) {
    throw "Expected exactly one APK in $releaseDirectory; pass -InputApk explicitly."
  }
  $InputApk = $releaseApks[0].FullName
}
if ([string]::IsNullOrWhiteSpace($OutputApk)) {
  $OutputApk = $InputApk
}

$inputPath = [System.IO.Path]::GetFullPath($InputApk)
$outputPath = [System.IO.Path]::GetFullPath($OutputApk)
$buildToolsPath = [System.IO.Path]::GetFullPath($BuildToolsDir)
$keystorePath = [System.IO.Path]::GetFullPath($Keystore)
$aapt = Join-Path $buildToolsPath "aapt.exe"
$aapt2 = Join-Path $buildToolsPath "aapt2.exe"
$zipalign = Join-Path $buildToolsPath "zipalign.exe"
$apksigner = Join-Path $buildToolsPath "apksigner.bat"

if ([string]::IsNullOrWhiteSpace($AndroidJar)) {
  $sdkRoot = Split-Path -Parent (Split-Path -Parent $buildToolsPath)
  $AndroidJar = Join-Path $sdkRoot "platforms\android-$targetSdk\android.jar"
}
$androidJarPath = [System.IO.Path]::GetFullPath($AndroidJar)

foreach ($requiredPath in @(
  $inputPath,
  $keystorePath,
  $manifestFile,
  $androidJarPath,
  $aapt,
  $aapt2,
  $zipalign,
  $apksigner
)) {
  if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
    throw "Required file not found: $requiredPath"
  }
}
if (-not (Test-Path -LiteralPath $resourceDirectory -PathType Container)) {
  throw "Android resource directory not found: $resourceDirectory"
}

$assetMap = @{
  "index.html" = @("assets/index.html", "assets/index 2.html")
  "app.js" = @("assets/app.js", "assets/app 2.js", "assets/app 3.js")
  "styles.css" = @("assets/styles.css", "assets/styles 2.css")
  "sw.js" = @("assets/sw.js", "assets/sw 2.js")
  "manifest.webmanifest" = @("assets/manifest.webmanifest")
  "app-icon.svg" = @("assets/app-icon.svg")
}

foreach ($sourceName in $assetMap.Keys) {
  $sourcePath = Join-Path $projectRoot $sourceName
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Web asset not found: $sourcePath"
  }
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("campus-apk-" + [guid]::NewGuid().ToString("N"))
$compiledResources = Join-Path $tempRoot "compiled-resources.zip"
$unsignedApk = Join-Path $tempRoot "unsigned.apk"
$alignedApk = Join-Path $tempRoot "aligned.apk"
$signedApk = Join-Path $tempRoot "signed.apk"

New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
  & $aapt2 compile --dir $resourceDirectory -o $compiledResources
  if ($LASTEXITCODE -ne 0) {
    throw "aapt2 resource compilation failed with exit code $LASTEXITCODE"
  }

  & $aapt2 link `
    -o $unsignedApk `
    -I $androidJarPath `
    --manifest $manifestFile `
    --min-sdk-version $minSdk `
    --target-sdk-version $targetSdk `
    --version-code $versionCode `
    --version-name $versionName `
    $compiledResources
  if ($LASTEXITCODE -ne 0) {
    throw "aapt2 APK linking failed with exit code $LASTEXITCODE"
  }

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $inputArchive = [System.IO.Compression.ZipFile]::OpenRead($inputPath)
  $outputArchive = [System.IO.Compression.ZipFile]::Open(
    $unsignedApk,
    [System.IO.Compression.ZipArchiveMode]::Update
  )

  try {
    $dexEntries = @($inputArchive.Entries | Where-Object {
      $_.FullName -match '^classes\d*\.dex$'
    })
    if ($dexEntries.Count -eq 0) {
      throw "No classes.dex entries found in input APK."
    }

    foreach ($sourceEntry in $dexEntries) {
      $targetEntry = $outputArchive.CreateEntry(
        $sourceEntry.FullName,
        [System.IO.Compression.CompressionLevel]::Optimal
      )
      $sourceStream = $sourceEntry.Open()
      $targetStream = $targetEntry.Open()
      try {
        $sourceStream.CopyTo($targetStream)
      } finally {
        $targetStream.Dispose()
        $sourceStream.Dispose()
      }
    }

    foreach ($sourceName in $assetMap.Keys) {
      $sourcePath = Join-Path $projectRoot $sourceName
      $sourceBytes = [System.IO.File]::ReadAllBytes($sourcePath)

      foreach ($entryName in $assetMap[$sourceName]) {
        $entry = $outputArchive.CreateEntry(
          $entryName,
          [System.IO.Compression.CompressionLevel]::Optimal
        )
        $stream = $entry.Open()
        try {
          $stream.Write($sourceBytes, 0, $sourceBytes.Length)
        } finally {
          $stream.Dispose()
        }
      }
    }
  } finally {
    $outputArchive.Dispose()
    $inputArchive.Dispose()
  }

  & $zipalign -f -p 4 $unsignedApk $alignedApk
  if ($LASTEXITCODE -ne 0) {
    throw "zipalign failed with exit code $LASTEXITCODE"
  }

  & $apksigner sign `
    --ks $keystorePath `
    --ks-key-alias $KeyAlias `
    --ks-pass "pass:$StorePassword" `
    --key-pass "pass:$KeyPassword" `
    --out $signedApk `
    $alignedApk
  if ($LASTEXITCODE -ne 0) {
    throw "apksigner failed with exit code $LASTEXITCODE"
  }

  & $zipalign -c 4 $signedApk
  if ($LASTEXITCODE -ne 0) {
    throw "APK alignment verification failed with exit code $LASTEXITCODE"
  }

  & $apksigner verify --verbose $signedApk
  if ($LASTEXITCODE -ne 0) {
    throw "APK signature verification failed with exit code $LASTEXITCODE"
  }

  $badging = (& $aapt dump badging $signedApk) -join "`n"
  if ($LASTEXITCODE -ne 0) {
    throw "APK package metadata verification failed with exit code $LASTEXITCODE"
  }
  $expectedBadging = "package: name='com.campushunt.tracker' versionCode='$versionCode' versionName='$versionName'"
  if (-not $badging.Contains($expectedBadging)) {
    throw "APK metadata does not match expected version: $expectedBadging"
  }

  $outputDirectory = Split-Path -Parent $outputPath
  if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  }
  Copy-Item -LiteralPath $signedApk -Destination $outputPath -Force

  Write-Host "APK generated: $outputPath ($versionName / versionCode $versionCode)"
} finally {
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
