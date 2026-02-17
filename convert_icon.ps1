
Add-Type -AssemblyName System.Drawing
$source = "c:\Users\rober\OneDrive\Escritorio\Birthminder\Birthminder\assets\icon.png"
$dest = "c:\Users\rober\OneDrive\Escritorio\Birthminder\Birthminder\assets\icon_fixed.png"
$img = [System.Drawing.Image]::FromFile($source)
$img.Save($dest, [System.Drawing.Imaging.ImageFormat]::Png)
$img.Dispose()
