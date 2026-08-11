@echo off
setlocal

REM Inicia frontend e backend em janelas separadas usando npm.cmd no Windows
set "ROOT=%~dp0"
set "FRONTEND_PORT=5176"

echo Iniciando BureauFlow...
echo.

start "BureauFlow Frontend" cmd /k "cd /d ""%ROOT%"" && npm.cmd install && npm.cmd run dev -- --host 0.0.0.0 --port %FRONTEND_PORT% --strictPort"
start "BureauFlow Backend" cmd /k "cd /d ""%ROOT%backend"" && npm.cmd install && npm.cmd run dev"

echo Frontend e backend iniciados em janelas separadas.
echo Frontend local: http://localhost:%FRONTEND_PORT%/
echo Frontend LAN:   http://SEU_IP_LOCAL:%FRONTEND_PORT%/
echo Backend:  http://127.0.0.1:3000/
echo Feche as janelas para encerrar os servicos.

endlocal
