param()

Add-Type -AssemblyName System.Drawing

$sizes = 16, 32, 48, 128, 300
$outputDirectory = Join-Path $PSScriptRoot "..\icons"
New-Item -ItemType Directory -Force -Path $outputDirectory | Out-Null

foreach ($size in $sizes) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::Transparent)

  $rect = [System.Drawing.RectangleF]::new(0, 0, [single]$size, [single]$size)
  $brush = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 251, 114, 153),
    [System.Drawing.Color]::FromArgb(255, 222, 66, 113),
    45.0
  )
  $graphics.FillEllipse($brush, $rect)

  $penWidth = [Math]::Max(1.5, $size * 0.09)
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::White, [single]$penWidth)
  $pen.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
  $pen.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
  $arcRect = [System.Drawing.RectangleF]::new(
    [single]($size * 0.25),
    [single]($size * 0.25),
    [single]($size * 0.5),
    [single]($size * 0.5)
  )
  $graphics.DrawArc($pen, $arcRect, -55, 285)

  [System.Drawing.PointF[]]$arrow = @(
    [System.Drawing.PointF]::new([single]($size * 0.72), [single]($size * 0.17)),
    [System.Drawing.PointF]::new([single]($size * 0.78), [single]($size * 0.38)),
    [System.Drawing.PointF]::new([single]($size * 0.57), [single]($size * 0.33))
  )
  $graphics.FillPolygon([System.Drawing.Brushes]::White, $arrow)

  $path = Join-Path $outputDirectory "icon-$size.png"
  $bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $pen.Dispose()
  $brush.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$storeAssetDirectory = Join-Path $PSScriptRoot "..\store\assets"
New-Item -ItemType Directory -Force -Path $storeAssetDirectory | Out-Null
Copy-Item -LiteralPath (Join-Path $outputDirectory "icon-300.png") -Destination (Join-Path $storeAssetDirectory "logo-300.png") -Force
