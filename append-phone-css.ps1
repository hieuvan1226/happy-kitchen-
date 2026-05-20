$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$src  = Join-Path $root '.css-phone.tmp'
$dst  = Join-Path $root 'style.css'
$existing = Get-Content -Raw -Path $dst
$add      = Get-Content -Raw -Path $src
[IO.File]::WriteAllText($dst, $existing + $add, [Text.UTF8Encoding]::new($false))
Remove-Item $src -Force
Write-Host ("style.css size: " + (Get-Item $dst).Length)
