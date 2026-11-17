# Cache busting for GitHub Pages: appends ?v=<content hash> to every reference of the site's own CSS/JS files.
# Run before each commit (it is idempotent: unchanged files keep their hash):
#   powershell -NoProfile -ExecutionPolicy Bypass -File tools\version-assets.ps1
# Order matters: main.js imports anim.js and data.js, so their hashes go into main.js first, then main.js is hashed.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$utf8 = New-Object System.Text.UTF8Encoding($false)   # UTF-8 without BOM, line endings untouched

function Read-Text($rel)  { [IO.File]::ReadAllText((Join-Path $root $rel), $utf8) }
function Write-Text($rel, $text) {
  $path = Join-Path $root $rel
  if ([IO.File]::ReadAllText($path, $utf8) -cne $text) { [IO.File]::WriteAllText($path, $text, $utf8); "updated  $rel" } else { "ok       $rel" }
}
function Get-Hash($rel) {
  $sha = [Security.Cryptography.SHA1]::Create()
  $bytes = [IO.File]::ReadAllBytes((Join-Path $root $rel))
  ([BitConverter]::ToString($sha.ComputeHash($bytes)) -replace '-', '').Substring(0, 8).ToLower()
}
# replaces  <name>  or  <name>?v=xxxx  directly followed by a quote
function Set-Version($text, $name, $hash) {
  $pattern = [regex]::Escape($name) + '(\?v=[0-9a-f]+)?(?=["''])'
  [regex]::Replace($text, $pattern, "$name`?v=$hash")
}

$hAnim = Get-Hash 'js/anim.js'
$hData = Get-Hash 'js/data.js'
$main = Read-Text 'js/main.js'
$main = Set-Version $main './anim.js' $hAnim
$main = Set-Version $main './data.js' $hData
Write-Text 'js/main.js' $main

$hMain = Get-Hash 'js/main.js'
$hCss = Get-Hash 'css/site.css'
$html = Read-Text 'index.html'
$html = Set-Version $html 'js/main.js' $hMain
$html = Set-Version $html 'js/anim.js' $hAnim
$html = Set-Version $html 'js/data.js' $hData
$html = Set-Version $html 'css/site.css' $hCss
Write-Text 'index.html' $html

$hLegal = Get-Hash 'legal.css'
foreach ($page in 'impressum.html', 'datenschutz.html') { Write-Text $page (Set-Version (Read-Text $page) 'legal.css' $hLegal) }
