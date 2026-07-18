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

function Get-UInt16LE([byte[]]$Bytes, [int]$Offset) {
  return [System.BitConverter]::ToUInt16($Bytes, $Offset)
}

function Get-UInt32LE([byte[]]$Bytes, [int]$Offset) {
  return [System.BitConverter]::ToUInt32($Bytes, $Offset)
}

function Set-UInt32LE([byte[]]$Bytes, [int]$Offset, [uint32]$Value) {
  $valueBytes = [System.BitConverter]::GetBytes($Value)
  [System.Array]::Copy($valueBytes, 0, $Bytes, $Offset, 4)
}

function Find-ByteSequence([byte[]]$Bytes, [byte[]]$Needle) {
  $matches = New-Object System.Collections.Generic.List[int]
  for ($offset = 0; $offset -le $Bytes.Length - $Needle.Length; $offset++) {
    $matched = $true
    for ($index = 0; $index -lt $Needle.Length; $index++) {
      if ($Bytes[$offset + $index] -ne $Needle[$index]) {
        $matched = $false
        break
      }
    }
    if ($matched) {
      $matches.Add($offset)
    }
  }
  return $matches.ToArray()
}

function Set-ManifestVersion(
  [byte[]]$ManifestBytes,
  [string]$OldVersionName,
  [string]$NewVersionName,
  [uint32]$NewVersionCode
) {
  $resourceMap = @{}
  $versionCodePatched = 0
  $chunkOffset = 8

  while ($chunkOffset -lt $ManifestBytes.Length) {
    $chunkType = Get-UInt16LE $ManifestBytes $chunkOffset
    $chunkSize = Get-UInt32LE $ManifestBytes ($chunkOffset + 4)
    if ($chunkSize -lt 8 -or $chunkOffset + $chunkSize -gt $ManifestBytes.Length) {
      throw "Invalid binary AndroidManifest.xml chunk at offset $chunkOffset."
    }

    if ($chunkType -eq 0x0180) {
      $resourceCount = [int](($chunkSize - 8) / 4)
      for ($index = 0; $index -lt $resourceCount; $index++) {
        $resourceMap[$index] = Get-UInt32LE $ManifestBytes ($chunkOffset + 8 + ($index * 4))
      }
    } elseif ($chunkType -eq 0x0102) {
      $attributeStart = Get-UInt16LE $ManifestBytes ($chunkOffset + 24)
      $attributeSize = Get-UInt16LE $ManifestBytes ($chunkOffset + 26)
      $attributeCount = Get-UInt16LE $ManifestBytes ($chunkOffset + 28)
      $attributeOffset = $chunkOffset + 16 + $attributeStart

      for ($index = 0; $index -lt $attributeCount; $index++) {
        $currentAttribute = $attributeOffset + ($index * $attributeSize)
        $nameIndex = Get-UInt32LE $ManifestBytes ($currentAttribute + 4)
        if ($resourceMap.ContainsKey([int]$nameIndex) -and $resourceMap[[int]$nameIndex] -eq 0x0101021b) {
          Set-UInt32LE $ManifestBytes ($currentAttribute + 16) $NewVersionCode
          $versionCodePatched++
        }
      }
    }

    $chunkOffset += $chunkSize
  }

  if ($versionCodePatched -ne 1) {
    throw "Expected one android:versionCode attribute, found $versionCodePatched."
  }

  if ($OldVersionName -ne $NewVersionName) {
    $oldVersionBytes = [System.Text.Encoding]::Unicode.GetBytes($OldVersionName)
    $newVersionBytes = [System.Text.Encoding]::Unicode.GetBytes($NewVersionName)
    if ($oldVersionBytes.Length -ne $newVersionBytes.Length) {
      throw "Binary version patch requires equal-length version names: $OldVersionName -> $NewVersionName"
    }

    $versionNameOffsets = @(Find-ByteSequence $ManifestBytes $oldVersionBytes)
    if ($versionNameOffsets.Count -ne 1) {
      throw "Expected one versionName string in AndroidManifest.xml, found $($versionNameOffsets.Count)."
    }
    [System.Array]::Copy(
      $newVersionBytes,
      0,
      $ManifestBytes,
      $versionNameOffsets[0],
      $newVersionBytes.Length
    )
  }

  return $ManifestBytes
}

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$versionFile = Join-Path $projectRoot "version.properties"

if (-not (Test-Path -LiteralPath $versionFile -PathType Leaf)) {
  throw "Version file not found: $versionFile"
}

$version = Get-Content -LiteralPath $versionFile -Raw | ConvertFrom-StringData
$versionName = $version.VERSION_NAME
$versionCode = $version.VERSION_CODE

if ($versionName -notmatch '^\d+\.\d+\.\d+$' -or $versionCode -notmatch '^\d+$') {
  throw "Invalid VERSION_NAME or VERSION_CODE in version.properties."
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
$zipalign = Join-Path $buildToolsPath "zipalign.exe"
$apksigner = Join-Path $buildToolsPath "apksigner.bat"

foreach ($requiredPath in @($inputPath, $keystorePath, $aapt, $zipalign, $apksigner)) {
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

$assetEntryNames = New-Object System.Collections.Generic.HashSet[string]
foreach ($sourceName in $assetMap.Keys) {
  $sourcePath = Join-Path $projectRoot $sourceName
  if (-not (Test-Path -LiteralPath $sourcePath -PathType Leaf)) {
    throw "Web asset not found: $sourcePath"
  }
  foreach ($entryName in $assetMap[$sourceName]) {
    [void]$assetEntryNames.Add($entryName)
  }
}

$tempRoot = Join-Path ([System.IO.Path]::GetTempPath()) ("campus-apk-" + [guid]::NewGuid().ToString("N"))
$workingApk = Join-Path $tempRoot "working.apk"
$alignedApk = Join-Path $tempRoot "aligned.apk"
$signedApk = Join-Path $tempRoot "signed.apk"

New-Item -ItemType Directory -Path $tempRoot | Out-Null

try {
  Copy-Item -LiteralPath $inputPath -Destination $workingApk

  $inputBadging = (& $aapt dump badging $workingApk) -join "`n"
  if ($LASTEXITCODE -ne 0 -or $inputBadging -notmatch "versionName='([^']+)'") {
    throw "Unable to read input APK versionName."
  }
  $oldVersionName = $Matches[1]

  Add-Type -AssemblyName System.IO.Compression
  Add-Type -AssemblyName System.IO.Compression.FileSystem

  $archive = [System.IO.Compression.ZipFile]::Open(
    $workingApk,
    [System.IO.Compression.ZipArchiveMode]::Update
  )

  try {
    $manifestEntry = $archive.GetEntry("AndroidManifest.xml")
    if ($null -eq $manifestEntry) {
      throw "AndroidManifest.xml not found in input APK."
    }
    $manifestStream = $manifestEntry.Open()
    $manifestBuffer = New-Object System.IO.MemoryStream
    try {
      $manifestStream.CopyTo($manifestBuffer)
      $manifestBytes = $manifestBuffer.ToArray()
    } finally {
      $manifestBuffer.Dispose()
      $manifestStream.Dispose()
    }

    $patchedManifest = Set-ManifestVersion `
      $manifestBytes `
      $oldVersionName `
      $versionName `
      ([uint32]$versionCode)

    $entriesToDelete = @($archive.Entries | Where-Object {
      $upperName = $_.FullName.ToUpperInvariant()
      $isSignature = $upperName -eq "META-INF/MANIFEST.MF" -or
        $upperName.EndsWith(".SF") -or
        $upperName.EndsWith(".RSA") -or
        $upperName.EndsWith(".DSA") -or
        $upperName.EndsWith(".EC")
      $isSignature -or $_.FullName -eq "AndroidManifest.xml" -or $assetEntryNames.Contains($_.FullName)
    })

    foreach ($entry in $entriesToDelete) {
      $entry.Delete()
    }

    $newManifestEntry = $archive.CreateEntry(
      "AndroidManifest.xml",
      [System.IO.Compression.CompressionLevel]::Optimal
    )
    $newManifestStream = $newManifestEntry.Open()
    try {
      $newManifestStream.Write($patchedManifest, 0, $patchedManifest.Length)
    } finally {
      $newManifestStream.Dispose()
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
