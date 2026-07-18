param(
  [string]$InputApk,
  [string]$OutputApk,
  [Parameter(Mandatory = $true)]
  [string]$BuildToolsDir,
  [string]$Keystore = (Join-Path $env:USERPROFILE ".android\debug.keystore"),
  [string]$KeyAlias = "androiddebugkey",
  [string]$StorePassword = "android",
  [string]$KeyPassword = "android"
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($InputApk)) {
  $releaseDirectory = Join-Path $PSScriptRoot "..\releases"
  $releaseApks = @(Get-ChildItem -LiteralPath $releaseDirectory -Filter "*.apk" -File)
  if ($releaseApks.Count -ne 1) {
    throw "Expected exactly one APK in $releaseDirectory; pass -InputApk explicitly."
  }
  $InputApk = $releaseApks[0].FullName
}
if ([string]::IsNullOrWhiteSpace($OutputApk)) {
  $OutputApk = $InputApk
}

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$inputPath = [System.IO.Path]::GetFullPath($InputApk)
$outputPath = [System.IO.Path]::GetFullPath($OutputApk)
$buildToolsPath = [System.IO.Path]::GetFullPath($BuildToolsDir)
$keystorePath = [System.IO.Path]::GetFullPath($Keystore)
$zipalign = Join-Path $buildToolsPath "zipalign.exe"
$apksigner = Join-Path $buildToolsPath "apksigner.bat"

foreach ($requiredPath in @($inputPath, $keystorePath, $zipalign, $apksigner)) {
  if (-not (Test-Path -LiteralPath $requiredPath -PathType Leaf)) {
    throw "Required file not found: $requiredPath"
  }
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
$workingApk = Join-Path $tempRoot "working.apk"
$alignedApk = Join-Path $tempRoot "aligned.apk"
$signedApk = Join-Path $tempRoot "signed.apk"

New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
  Copy-Item -LiteralPath $inputPath -Destination $workingApk

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $archive = [System.IO.Compression.ZipFile]::Open(
    $workingApk,
    [System.IO.Compression.ZipArchiveMode]::Update
  )

  try {
    $entriesToDelete = @($archive.Entries | Where-Object {
      $entryName = $_.FullName
      $upperName = $entryName.ToUpperInvariant()
      $isSignature = $upperName -eq "META-INF/MANIFEST.MF" -or
        $upperName.EndsWith(".SF") -or
        $upperName.EndsWith(".RSA") -or
        $upperName.EndsWith(".DSA") -or
        $upperName.EndsWith(".EC")
      $isAsset = $assetMap.Values | Where-Object { $_ -contains $entryName }
      $isSignature -or $null -ne $isAsset
    })

    foreach ($entry in $entriesToDelete) {
      $entry.Delete()
    }

    foreach ($sourceName in $assetMap.Keys) {
      $sourcePath = Join-Path $projectRoot $sourceName
      $sourceBytes = [System.IO.File]::ReadAllBytes($sourcePath)

      foreach ($entryName in $assetMap[$sourceName]) {
        $entry = $archive.CreateEntry(
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
    $archive.Dispose()
  }

  & $zipalign -f -p 4 $workingApk $alignedApk
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

  $outputDirectory = Split-Path -Parent $outputPath
  if (-not (Test-Path -LiteralPath $outputDirectory)) {
    New-Item -ItemType Directory -Path $outputDirectory -Force | Out-Null
  }
  Copy-Item -LiteralPath $signedApk -Destination $outputPath -Force

  Write-Host "APK generated: $outputPath"
} finally {
  if (Test-Path -LiteralPath $tempRoot) {
    Remove-Item -LiteralPath $tempRoot -Recurse -Force
  }
}
