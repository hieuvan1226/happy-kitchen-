$ErrorActionPreference = 'Stop'
$root  = Split-Path -Parent $PSScriptRoot
$parts = 1..8 | ForEach-Object { Join-Path $root (".css-part-$_.tmp") }
$out   = Join-Path $root 'style.css'
$contents = ''
foreach ($p in $parts) {
  if (Test-Path $p) { $contents += (Get-Content -Raw -Path $p) }
}
[IO.File]::WriteAllText($out, $contents, [Text.UTF8Encoding]::new($false))
foreach ($p in $parts) { if (Test-Path $p) { Remove-Item $p -Force } }
Write-Host ("style.css size: " + (Get-Item $out).Length)
