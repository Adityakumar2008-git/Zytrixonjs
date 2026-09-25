@echo off
title Zytrixon Local Server
echo ==============================================
echo   Starting Zytrixon Local Node.js Server...
echo ==============================================

set "PATH=%LOCALAPPDATA%\Programs\nodejs;C:\Program Files\nodejs;C:\Program Files\GensparkSoftware\Genspark-Browser\Application\141.1.9.127\nx_node_app\bin;%PATH%"

where node >nul 2>nul
if %errorlevel% equ 0 (
    start http://localhost:3000
    node server.js
) else (
    start http://localhost:3000
    "C:\Program Files\GensparkSoftware\Genspark-Browser\Application\141.1.9.127\nx_node_app\bin\node.exe" server.js
)
pause
