Add-Type -AssemblyName System.Drawing

$iconPath = "c:\Users\Lenovo\Downloads\raj anna Task\public\pharmaflow-icon.png"
$bmp = [System.Drawing.Bitmap]::FromFile($iconPath)

$transBmp = New-Object System.Drawing.Bitmap($bmp.Width, $bmp.Height, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)

for ($x = 0; $x -lt $bmp.Width; $x++) {
    for ($y = 0; $y -lt $bmp.Height; $y++) {
        $pixel = $bmp.GetPixel($x, $y)
        # Background is near white/light gray (R > 232, G > 235, B > 238)
        $brightness = ($pixel.R + $pixel.G + $pixel.B) / 3.0
        if ($pixel.R -gt 230 -and $pixel.G -gt 230 -and $pixel.B -gt 230) {
            # Fully transparent for pure white/light gray
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb(0, $pixel.R, $pixel.G, $pixel.B))
        } elseif ($brightness -gt 210) {
            # Smooth feather alpha
            $alpha = [int]([Math]::Max(0, [Math]::Min(255, (255 - $brightness) * 5)))
            $transBmp.SetPixel($x, $y, [System.Drawing.Color]::FromArgb($alpha, $pixel.R, $pixel.G, $pixel.B))
        } else {
            $transBmp.SetPixel($x, $y, $pixel)
        }
    }
}

$transBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\public\pharmaflow-icon-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)
$transBmp.Save("c:\Users\Lenovo\Downloads\raj anna Task\src\assets\pharmaflow-icon-transparent.png", [System.Drawing.Imaging.ImageFormat]::Png)

$transBmp.Dispose()
$bmp.Dispose()
Write-Host "Transparent icon created successfully!"
