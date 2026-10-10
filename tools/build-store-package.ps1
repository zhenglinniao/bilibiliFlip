param()

$ErrorActionPreference = "Stop"
$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
$distDirectory = Join-Path $projectRoot "dist"
$packagePath = Join-Path $distDirectory "video-zhuan-zhuan-edge-v1.0.0.zip"

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
