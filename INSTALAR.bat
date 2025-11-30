@echo off
title PhotoSite360 - Instalador

echo ========================================
echo   PhotoSite360 - Instalador
echo ========================================
echo.

echo [1/2] Instalando backend...
cd backend
pip install -r requirements.txt
cd ..
echo.

echo [2/2] Instalando frontend...
cd frontend
npm install --legacy-peer-deps
cd ..
echo.

echo ========================================
echo   INSTALACION COMPLETADA
echo ========================================
echo.
echo Para iniciar: ejecuta INICIAR.bat
pause