# Script para build do APK
Write-Host "Preparando ambiente para build..." -ForegroundColor Green

# Limpar cache do Expo
Write-Host "Limpando cache..." -ForegroundColor Yellow
if (Test-Path ".expo") {
    Remove-Item -Recurse -Force ".expo" -ErrorAction SilentlyContinue
}

# Limpar node_modules/.cache se existir
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache" -ErrorAction SilentlyContinue
}

# Definir variáveis de ambiente temporárias
$env:TMP = "C:\temp-eas"
$env:TEMP = "C:\temp-eas"
$env:TMPDIR = "C:\temp-eas"

# Criar pasta temporária limpa
New-Item -ItemType Directory -Force -Path "C:\temp-eas" | Out-Null

Write-Host "Iniciando build do APK..." -ForegroundColor Green
Write-Host "Isso pode levar 10-20 minutos..." -ForegroundColor Yellow

# Executar build
eas build -p android --profile preview --non-interactive

