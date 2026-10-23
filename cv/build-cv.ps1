# Regenerates public/resume.pdf from cv/resume.html using headless Microsoft Edge.
# Usage (from the project root): powershell -ExecutionPolicy Bypass -File cv/build-cv.ps1
$root = Split-Path -Parent $PSScriptRoot
$html = Join-Path $PSScriptRoot 'resume.html'
$pdf = Join-Path $root 'public\resume.pdf'
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
$profileDir = Join-Path $env:TEMP 'cv-edge-profile'

Start-Process -FilePath $edge -Wait -ArgumentList @(
  '--headless=new', '--disable-gpu', '--no-pdf-header-footer', '--print-to-pdf-no-header',
  # Windows PowerShell does not quote array arguments, so paths with spaces are quoted here.
  "--user-data-dir=`"$profileDir`"", "--print-to-pdf=`"$pdf`"", ([System.Uri]$html).AbsoluteUri
)
Get-Item $pdf | Select-Object FullName, Length
