Add-Type -AssemblyName System.Drawing

$srcPath = "c:\Users\Lenovo\Downloads\raj anna Task\public\pharmaflow-logo.jpg"
$src = [System.Drawing.Image]::FromFile($srcPath)

# 1. Clean Square Emblem Icon (PF 21 emblem with perfect padding, no text below, arrow intact)
$emblemCrop = [System.Drawing.Rectangle]::new(370, 45, 285, 275)
$emblemBmp = New-Object System.Drawing.Bitmap(285, 275)
$g = [System.Drawing.Graphics]::FromImage($emblemBmp)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, 285, 275), $emblemCrop, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()

$emblemBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\public\pharmaflow-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$emblemBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\src\assets\pharmaflow-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$emblemBmp.Dispose()

# 2. Complete Badge (Emblem + PHARMAFLOW 21 + Platform + Developed by Mr. Naveen Kumar Majji)
$badgeCrop = [System.Drawing.Rectangle]::new(265, 45, 495, 455)
$badgeBmp = New-Object System.Drawing.Bitmap(495, 455)
$g2 = [System.Drawing.Graphics]::FromImage($badgeBmp)
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.DrawImage($src, [System.Drawing.Rectangle]::new(0, 0, 495, 455), $badgeCrop, [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$badgeBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\public\pharmaflow-badge.png", [System.Drawing.Imaging.ImageFormat]::Png)
$badgeBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\src\assets\pharmaflow-badge.png", [System.Drawing.Imaging.ImageFormat]::Png)
$badgeBmp.Dispose()

$src.Dispose()
Write-Host "Updated logo variants generated successfully!"
