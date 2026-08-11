@echo off
setlocal

REM Execucao local estavel para navegadores fora da IDE (modo producao)
set "ROOT=%~dp0"
set "FRONTEND_PORT=4173"

echo Preparando BureauFlow em modo producao local...
echo.

cd /d "%ROOT%"
call npm.cmd install
if errorlevel 1 goto :fail
call npm.cmd run build
if errorlevel 1 goto :fail

cd /d "%ROOT%backend"
call npm.cmd install
if errorlevel 1 goto :fail
call npm.cmd run build
if errorlevel 1 goto :fail

start "BureauFlow API (prod local)" cmd /k "cd /d ""%ROOT%backend"" && npm.cmd run start"
start "BureauFlow Frontend (preview)" cmd /k "cd /d ""%ROOT%"" && npm.cmd run preview"

echo.
echo Frontend: http://127.0.0.1:%FRONTEND_PORT%/
echo Backend:  http://127.0.0.1:3000/
echo.
echo Para encerrar, feche as duas janelas abertas.
goto :end

:fail
echo.
echo Falha ao preparar o ambiente. Verifique mensagens acima.
exit /b 1

:end
endlocal
