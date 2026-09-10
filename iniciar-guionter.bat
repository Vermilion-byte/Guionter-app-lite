@echo off
title Guionter Lite - servidor local
cd /d "%~dp0"

echo Buscando Python o Node para levantar el servidor local...
echo.

where python >nul 2>nul
if %ERRORLEVEL%==0 (
    echo Usando Python. Abriendo Guionter Lite en tu navegador...
    start "" http://localhost:8080
    python -m http.server 8080
    goto :eof
)

where npx >nul 2>nul
if %ERRORLEVEL%==0 (
    echo Usando Node/npx. Abriendo Guionter Lite en tu navegador...
    start "" http://localhost:8080
    npx --yes serve -l 8080
    goto :eof
)

echo No se encontro Python ni Node.js instalados en este equipo.
echo Instala uno de los dos para poder instalar Guionter Lite como app:
echo   - Python:  https://www.python.org/downloads/
echo   - Node.js: https://nodejs.org/
echo.
pause
