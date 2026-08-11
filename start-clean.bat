@echo off
setlocal

REM Fecha processos que estejam usando as portas do BureauFlow
for %%P in (5176 3000) do (
  for /f "tokens=5" %%I in ('netstat -ano ^| findstr :%%P ^| findstr LISTENING') do (
    taskkill /PID %%I /F >nul 2>nul
  )
)

REM Inicia o projeto com porta fixa
call "%~dp0start-dev.bat"

endlocal
