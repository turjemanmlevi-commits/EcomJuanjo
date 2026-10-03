$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
$csvPath = Join-Path $root 'winners_combinado_100.csv'
$assetRoot = Join-Path $root 'theme\assets\products\source'
$manifestPath = Join-Path $root 'data\source-images.json'
New-Item -ItemType Directory -Force -Path $assetRoot | Out-Null

function Get-Slug([string]$value) {
  $normalized = $value.Normalize([Text.NormalizationForm]::FormD) -replace '\p{Mn}', ''
  return (($normalized.ToLowerInvariant() -replace '[^a-z0-9]+', '-').Trim('-'))
}

function Get-ImageUrls([string]$html, [string]$pageUrl) {
  $urls = [System.Collections.Generic.List[string]]::new()
  $ogMatches = [regex]::Matches($html, '<meta[^>]+property=["'']og:image["''][^>]+content=["'']([^"'']+)', 'IgnoreCase')
  foreach ($m in $ogMatches) { $urls.Add($m.Groups[1].Value) }
  $rawMatches = [regex]::Matches($html, '(?:(?:https?:)?//)[^"''<>\s]+?\.(?:jpe?g|png|webp)(?:\?[^"''<>\s]*)?', 'IgnoreCase')
  foreach ($m in $rawMatches) { $urls.Add($m.Value) }
  $seen = @{}
  $result = @()
  foreach ($raw in $urls) {
    $u = $raw -replace '\\u0026', '&' -replace '\\/', '/' -replace '&amp;', '&'
    if ($u.StartsWith('//')) { $u = 'https:' + $u }
    try { $absolute = [Uri]::new([Uri]$pageUrl, $u).AbsoluteUri } catch { continue }
    if ($absolute -match '(?i)(logo|favicon|icon|trustpilot|review|avatar|payment|badge|placeholder|sprite)') { continue }
    $key = ($absolute -replace '(?i)[?&](width|height|size|crop|format)=[^&]+', '').TrimEnd('?','&')
    if (-not $seen.ContainsKey($key)) { $seen[$key] = $true; $result += $absolute }
  }
  return $result | Select-Object -First 4
}

$rows = Import-Csv $csvPath -Delimiter ';'
$manifest = [ordered]@{}
$failures = @()
$index = 0
foreach ($row in $rows) {
  $index++
  $slug = Get-Slug $row.Producto
  $dir = Join-Path $assetRoot $slug
  New-Item -ItemType Directory -Force -Path $dir | Out-Null
  Write-Host ("[{0}/{1}] {2}" -f $index, $rows.Count, $row.Producto)
  try {
    $page = Invoke-WebRequest -Uri $row.Link -UseBasicParsing -TimeoutSec 30 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
    $imageUrls = @(Get-ImageUrls $page.Content $row.Link)
    $localImages = @()
    $imageIndex = 0
    foreach ($imageUrl in $imageUrls) {
      $imageIndex++
      try {
        $response = Invoke-WebRequest -Uri $imageUrl -UseBasicParsing -TimeoutSec 30 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
        $contentType = [string]$response.Headers['Content-Type']
        $extension = if ($contentType -match 'webp') { 'webp' } elseif ($contentType -match 'png') { 'png' } elseif ($contentType -match 'jpeg') { 'jpg' } else { 'jpg' }
        $fileName = '{0:D2}-source.{1}' -f $imageIndex, $extension
        $filePath = Join-Path $dir $fileName
        [IO.File]::WriteAllBytes($filePath, $response.Content)
        $localImages += ('assets/products/source/{0}/{1}' -f $slug, $fileName)
      } catch { }
    }
    if ($localImages.Count -gt 0) {
      $manifest[$row.Link] = [ordered]@{ product = $row.Producto; images = $localImages; sourceImages = $imageUrls }
    } else {
      $failures += [ordered]@{ product = $row.Producto; url = $row.Link; reason = 'No se pudo descargar ninguna imagen' }
    }
  } catch {
    $failures += [ordered]@{ product = $row.Producto; url = $row.Link; reason = $_.Exception.Message }
  }
}

$manifest | ConvertTo-Json -Depth 8 | Set-Content -Path $manifestPath -Encoding UTF8
$failures | ConvertTo-Json -Depth 8 | Set-Content -Path (Join-Path $root 'data\source-image-failures.json') -Encoding UTF8
Write-Host ("Descargadas imágenes para {0} de {1} productos; fallos: {2}" -f $manifest.Count, $rows.Count, $failures.Count)
