param()

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$distDirectory = Join-Path $projectRoot "dist"
$manifest = Get-Content -Raw -Encoding UTF8 (Join-Path $projectRoot "manifest.json") | ConvertFrom-Json
$packagePath = Join-Path $distDirectory "bilibili-video-rotate-edge-v$($manifest.version).zip"

New-Item -ItemType Directory -Force -Path $distDirectory | Out-Null
if (Test-Path -LiteralPath $packagePath) {
  Remove-Item -LiteralPath $packagePath -Force
}

$packageItems = @(
  (Join-Path $projectRoot "manifest.json"),
  (Join-Path $projectRoot "background.js"),
  (Join-Path $projectRoot "content.css"),
  (Join-Path $projectRoot "src"),
  (Join-Path $projectRoot "popup"),
  (Join-Path $projectRoot "icons")
)

Compress-Archive -LiteralPath $packageItems -DestinationPath $packagePath -CompressionLevel Optimal
Write-Output $packagePath
