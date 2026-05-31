@echo off
title NofufAudio

echo [NofufAudio] Iniciando...

where node >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Node.js no encontrado. Instala desde https://nodejs.org
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo [INFO] Instalando dependencias por primera vez...
    npm install
    if errorlevel 1 (
        echo [ERROR] Fallo al instalar dependencias.
        pause
        exit /b 1
    )
)

if not exist "yt-dlp.exe" (
    echo [AVISO] yt-dlp.exe no encontrado. La descarga puede no funcionar.
)

echo [INFO] Arrancando NofufAudio...
npm start
