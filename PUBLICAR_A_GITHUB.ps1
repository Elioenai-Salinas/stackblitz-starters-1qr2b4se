#!/usr/bin/env pwsh
# Script para publicar CARGOS_MORA en GitHub Pages
# Uso: ./PUBLICAR_A_GITHUB.ps1

Write-Host "`n=====================================`n" -ForegroundColor Cyan
Write-Host "📤 PUBLICADOR: CARGOS_MORA en GitHub" -ForegroundColor Green
Write-Host "`n=====================================`n" -ForegroundColor Cyan

# Validar que estamos en la carpeta correcta
if (-not (Test-Path "index.html")) {
    Write-Host "❌ ERROR: No encuentro index.html aquí" -ForegroundColor Red
    Write-Host "   Debe estar en: CARGOS_MORA/INFORME_WEB/" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Carpeta correcta encontrada`n" -ForegroundColor Green

# 1. Validar que git está instalado
if (-not (Get-Command git -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Git no está instalado" -ForegroundColor Red
    Write-Host "   Descárgalo desde: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Git verificado`n" -ForegroundColor Green

# 2. Preguntar por el usuario de GitHub
Write-Host "¿Cuál es tu USUARIO de GitHub?" -ForegroundColor Yellow
$githubUser = Read-Host "Usuario"

if ([string]::IsNullOrWhiteSpace($githubUser)) {
    Write-Host "❌ Usuario no puede estar vacío" -ForegroundColor Red
    exit 1
}

Write-Host "Usando usuario: $githubUser`n" -ForegroundColor Green

# 3. Inicializar git
Write-Host "📝 Inicializando repositorio git..." -ForegroundColor Cyan
git init
git config user.email "noreply@buenpastor.edu"
git config user.name "CARGOS_MORA Bot"

# 4. Agregar archivos
Write-Host "`n📦 Agregando archivos..." -ForegroundColor Cyan
git add .

# 5. Primer commit
Write-Host "`n💾 Haciendo commit inicial..." -ForegroundColor Cyan
git commit -m "🎉 CARGOS_MORA Informe Ejecutivo - Versión 1.0"

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Es posible que ya exista un repositorio git aquí" -ForegroundColor Yellow
}

# 6. Agregar remote
Write-Host "`n🔗 Conectando con GitHub..." -ForegroundColor Cyan
$remoteUrl = "https://github.com/$githubUser/cargos-mora-informe.git"
Write-Host "URL: $remoteUrl`n" -ForegroundColor Cyan

git remote remove origin -ErrorAction SilentlyContinue
git remote add origin $remoteUrl

# 7. Cambiar a rama main
git branch -M main

# 8. Push
Write-Host "📤 Subiendo a GitHub..." -ForegroundColor Cyan
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n`n✅ ¡ÉXITO! Tu web está publicada`n" -ForegroundColor Green
    Write-Host "🌐 URL: https://$githubUser.github.io/cargos-mora-informe" -ForegroundColor Cyan
    Write-Host "`n⏳ Espera 1-2 minutos para que GitHub genere la web" -ForegroundColor Yellow
    Write-Host "`n📲 Puedes compartir ese link con cualquiera`n" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error al subir a GitHub" -ForegroundColor Red
    Write-Host "Por favor, sigue las instrucciones en: PUBLICAR_EN_GITHUB.txt" -ForegroundColor Yellow
}

Write-Host "`n=====================================`n" -ForegroundColor Cyan
