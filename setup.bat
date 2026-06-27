@echo off
REM ═══════════════════════════════════════════════
REM NofufAudio PWA - Setup Script (Windows)
REM ═══════════════════════════════════════════════

setlocal enabledelayedexpansion

cls
echo.
echo   ╔════════════════════════════════════════════╗
echo   ║    🎵 NofufAudio PWA - Setup                ║
echo   ╚════════════════════════════════════════════╝
echo.

REM Verificar Node.js
echo [1/5] Verificando Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js no encontrado
    echo    Descargalo en: https://nodejs.org/
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VER=%%i
    echo ✅ Node.js !NODE_VER! encontrado
)

echo.
echo [2/5] Verificando npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm no encontrado
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VER=%%i
    echo ✅ npm !NPM_VER! encontrado
)

echo.
echo [3/5] Instalando dependencias...
call npm install
if errorlevel 1 (
    echo ❌ Error instalando dependencias
    pause
    exit /b 1
) else (
    echo ✅ Dependencias instaladas
)

echo.
echo [4/5] Verificando estructura...
if exist "package.json" (echo ✅ package.json encontrado) else (echo ❌ package.json no encontrado)
if exist "server.js" (echo ✅ server.js encontrado) else (echo ❌ server.js no encontrado)
if exist "manifest.json" (echo ✅ manifest.json encontrado) else (echo ❌ manifest.json no encontrado)
if exist "public\sw.js" (echo ✅ public\sw.js encontrado) else (echo ❌ public\sw.js no encontrado)
if exist "src\index.html" (echo ✅ src\index.html encontrado) else (echo ❌ src\index.html no encontrado)
if exist "src\app.js" (echo ✅ src\app.js encontrado) else (echo ❌ src\app.js no encontrado)

echo.
echo [5/5] Creando variables de ambiente...
if not exist ".env" (
    (
        echo PORT=3000
        echo NODE_ENV=development
        echo BASE_URL=http://localhost:3000
    ) > .env
    echo ✅ .env creado
) else (
    echo ✅ .env ya existe
)

echo.
echo ╔════════════════════════════════════════════╗
echo ║   ✅ Setup Completado                       ║
echo ╚════════════════════════════════════════════╝
echo.
echo Próximos pasos:
echo   1. Abre Terminal aqui
echo   2. Ejecuta: npm run dev
echo   3. Abre: http://localhost:3000
echo.
echo Documentación:
echo   - README_PWA.md
echo   - QUICKSTART.md
echo   - PWA_README.md
echo.
pause
