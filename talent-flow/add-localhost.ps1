$hostsPath = "$env:windir\System32\drivers\etc\hosts"
$content = Get-Content $hostsPath
if (-not ($content -match "^127\.0\.0\.1\s+localhost")) {
    Add-Content -Path $hostsPath -Value "127.0.0.1 localhost" -Encoding ASCII
    Write-Host "Successfully added localhost entry"
} else {
    Write-Host "localhost entry already exists"
}