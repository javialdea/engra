Add-Type -AssemblyName System.Drawing

function New-EngraIcon($path, $size) {
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

  $primary = [System.Drawing.Color]::FromArgb(31, 110, 82)
  $skin = [System.Drawing.Color]::FromArgb(232, 196, 160)
  $hair = [System.Drawing.Color]::FromArgb(227, 196, 128)
  $ink = [System.Drawing.Color]::FromArgb(43, 37, 48)

  $g.Clear($primary)

  $cx = $size / 2
  $hairR = $size * 0.34
  $hairCy = $size * 0.42
  $hairBrush = New-Object System.Drawing.SolidBrush($hair)
  $g.FillEllipse($hairBrush, $cx - $hairR, $hairCy - $hairR, $hairR * 2, $hairR * 2)

  $faceR = $size * 0.29
  $faceCy = $size * 0.56
  $faceBrush = New-Object System.Drawing.SolidBrush($skin)
  $g.FillEllipse($faceBrush, $cx - $faceR, $faceCy - $faceR, $faceR * 2, $faceR * 2)

  $penW = [Math]::Max(2, $size * 0.02)
  $pen = New-Object System.Drawing.Pen($ink, $penW)
  $glassR = $size * 0.078
  $gy = $faceCy - $size * 0.01
  $g.DrawEllipse($pen, $cx - $glassR * 2.2, $gy - $glassR, $glassR * 2, $glassR * 2)
  $g.DrawEllipse($pen, $cx + $glassR * 0.2, $gy - $glassR, $glassR * 2, $glassR * 2)
  $g.DrawLine($pen, $cx - $glassR * 0.2, $gy, $cx + $glassR * 0.2, $gy)

  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $g.Dispose()
  $bmp.Dispose()
}

New-EngraIcon "C:\Users\Javier\Desktop\Engra\public\icon-512.png" 512
New-EngraIcon "C:\Users\Javier\Desktop\Engra\public\icon-192.png" 192
New-EngraIcon "C:\Users\Javier\Desktop\Engra\public\apple-touch-icon.png" 180

"done"
