@echo off
cd /d "%~dp0"
if not defined SINIFKART_DATA set "SINIFKART_DATA=%~dp0Veri"
where py >nul 2>nul
if not errorlevel 1 (
  py -3 server.py
) else (
  python server.py
)
pause
