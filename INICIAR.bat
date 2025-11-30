@echo off
title PhotoSite360

echo Iniciando PhotoSite360...
echo.

start "Backend" cmd /k "cd backend && python main.py"
timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 5 /nobreak >nul

start http://localhost:3000

echo.
echo Aplicacion iniciada!
echo Backend: http://localhost:8001
echo Frontend: http://localhost:3000
pause