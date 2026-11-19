param([string]$InDir, [string]$OutDir)
Add-Type -AssemblyName System.Drawing

$installed = (New-Object System.Drawing.Text.InstalledFontCollection).Families | ForEach-Object { $_.Name }
$fontName = @('Arial Rounded MT Bold', 'Segoe UI Black', 'Arial Black', 'Impact') | Where-Object { $installed -contains $_ } | Select-Object -First 1
"font=$fontName"
$family = New-Object System.Drawing.FontFamily($fontName)
$ink = [System.Drawing.ColorTranslator]::FromHtml('#2b2340')

function New-Canvas([string]$src, [int]$w, [int]$h) {
  $img = [System.Drawing.Image]::FromFile($src)
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  # cover-crop, centred
  $s = [Math]::Max($w / $img.Width, $h / $img.Height)
  $dw = $img.Width * $s; $dh = $img.Height * $s
  $g.DrawImage($img, [single](($w - $dw) / 2), [single](($h - $dh) / 2), [single]$dw, [single]$dh)
  $img.Dispose()
  return @{ bmp = $bmp; g = $g }
}

# lines: array of @{t='POGO'; c='#ffc23d'}; block fitted to $width, top-left at ($x,$y), rotated by $angle around block centre
function Add-Title($g, $lines, [single]$x, [single]$y, [single]$width, [single]$angle, [single]$gap) {
  $paths = @(); $curY = 0.0; $maxH = 0.0
  foreach ($ln in $lines) {
    $p = New-Object System.Drawing.Drawing2D.GraphicsPath
    $p.AddString($ln.t, $family, [int][System.Drawing.FontStyle]::Bold, 200, (New-Object System.Drawing.PointF(0, 0)), [System.Drawing.StringFormat]::GenericTypographic)
    $b = $p.GetBounds()
    $s = $width / $b.Width
    $m = New-Object System.Drawing.Drawing2D.Matrix
    $m.Translate($x, $y + $curY)
    $m.Scale($s, $s)
    $m.Translate(-$b.X, -$b.Y)
    $p.Transform($m)
    $curY += $b.Height * $s + $gap
    $paths += @{ p = $p; c = $ln.c }
  }
  $totalH = $curY - $gap
  $stroke = [single]($width * 0.045)
  $drop = [single]($width * 0.022)
  $state = $g.Save()
  $g.TranslateTransform($x + $width / 2, $y + $totalH / 2)
  $g.RotateTransform($angle)
  $g.TranslateTransform(-($x + $width / 2), -($y + $totalH / 2))
  $pen = New-Object System.Drawing.Pen($ink, $stroke)
  $pen.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
  $inkBrush = New-Object System.Drawing.SolidBrush($ink)
  # drop shadow (solid ink, offset down)
  foreach ($it in $paths) {
    $sp = $it.p.Clone(); $mm = New-Object System.Drawing.Drawing2D.Matrix; $mm.Translate(0, $drop); $sp.Transform($mm)
    $g.DrawPath($pen, $sp); $g.FillPath($inkBrush, $sp); $sp.Dispose()
  }
  foreach ($it in $paths) { $g.DrawPath($pen, $it.p) }
  foreach ($it in $paths) {
    $br = New-Object System.Drawing.SolidBrush([System.Drawing.ColorTranslator]::FromHtml($it.c))
    $g.FillPath($br, $it.p); $br.Dispose()
  }
  $g.Restore($state)
  return $totalH
}

function Save-Png($c, [string]$path) {
  $c.g.Dispose(); $c.bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png); $c.bmp.Dispose()
  "saved $(Split-Path $path -Leaf)"
}

$land = (Get-ChildItem $InDir -Filter '*16x9.png' | Select-Object -First 1).FullName
$port = (Get-ChildItem $InDir -Filter '*2x3.png' | Select-Object -First 1).FullName
$sq   = (Get-ChildItem $InDir -Filter '*1x1-v2.png' | Select-Object -First 1).FullName
$yel = '#ffc23d'; $red = '#ff6b4a'; $wht = '#ffffff'

# 1) CrazyGames landscape 1920x1080: two lines, upper-left
$c = New-Canvas $land 1920 1080
[void](Add-Title $c.g @(@{t='POGO'; c=$yel}, @{t='POST'; c=$red}) 110 90 620 -5 34)
Save-Png $c (Join-Path $OutDir 'pogo-post-cg-1920x1080.png')

# 2) CrazyGames portrait 800x1200: one line across the top
$c = New-Canvas $port 800 1200
[void](Add-Title $c.g @(@{t='POGO POST'; c=$yel}) 70 34 660 -3 0)
Save-Png $c (Join-Path $OutDir 'pogo-post-cg-800x1200.png')

# 3) CrazyGames square 800x800: one line across the top
$c = New-Canvas $sq 800 800
[void](Add-Title $c.g @(@{t='POGO POST'; c=$yel}) 60 34 680 -3 0)
Save-Png $c (Join-Path $OutDir 'pogo-post-cg-800x800.png')

# 4) Poki icon 628x628, no text
$c = New-Canvas $sq 628 628
Save-Png $c (Join-Path $OutDir 'pogo-post-poki-628x628-notext.png')
