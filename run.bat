@echo off
setlocal enabledelayedexpansion

:: Set window title and code page for UTF-8
title Sri Angalamman Blue Metals - Project Launcher
chcp 65001 >nul

:: Switch to project root directory
cd /d "%~dp0"

echo ================================================================
echo       SRI ANGALAMMAN BLUE METALS - FULL STACK APPLICATION
echo ================================================================
echo.

:: 1. Verify Node.js installation
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not found in system PATH.
    echo Please install Node.js from https://nodejs.org/ and try again.
    echo.
    pause
    exit /b 1
)

:: 2. Verify NPM installation
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] npm is not installed or not found in system PATH.
    echo Please install Node.js (with npm) and try again.
    echo.
    pause
    exit /b 1
)

echo [✓] Node.js version: 
node -v
echo [✓] NPM version: 
npm -v
echo.

:: 3. Check and install backend dependencies if missing
if not exist "%~dp0backend\node_modules\" (
    echo [!] Backend dependencies missing. Running 'npm install' in backend...
    cd /d "%~dp0backend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install backend dependencies.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo [✓] Backend dependencies installed.
    echo.
)

:: 4. Check and install frontend dependencies if missing
if not exist "%~dp0frontend\node_modules\" (
    echo [!] Frontend dependencies missing. Running 'npm install' in frontend...
    cd /d "%~dp0frontend"
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install frontend dependencies.
        pause
        exit /b 1
    )
    cd /d "%~dp0"
    echo [✓] Frontend dependencies installed.
    echo.
)

:: 5. Launch Backend Server in separate window
echo Starting Backend Server (Port 5000)...
start "Blue Metals - Backend (Port 5000)" cmd /k "title Blue Metals - Backend (Port 5000) && cd /d "%~dp0backend" && echo Starting Express Backend on port 5000... && npm start"

:: Small delay to let backend initialize
timeout /t 2 /nobreak >nul

:: 6. Launch Frontend Dev Server in separate window
echo Starting Frontend Server (Port 5173)...
start "Blue Metals - Frontend (Port 5173)" cmd /k "title Blue Metals - Frontend (Port 5173) && cd /d "%~dp0frontend" && echo Starting Vite Dev Server on port 5173... && npm run dev"

:: Wait for frontend to spin up
timeout /t 3 /nobreak >nul

:: 7. Launch default browser
echo Opening website in default browser...
start http://localhost:5173

echo.
echo ================================================================
echo                    APPLICATION RUNNING!
echo ================================================================
echo.
echo  - Frontend Web App : http://localhost:5173
echo  - Backend API      : http://localhost:5000
echo  - API Health Check : http://localhost:5000/api/health
echo.
echo  Keep the opened terminal windows running to keep servers active.
echo  To shut down, you can close those windows or use the menu below.
echo ================================================================
echo.

:MENU
echo [1] Re-open Frontend in Browser (http://localhost:5173)
echo [2] Check Backend Health (http://localhost:5000/api/health)
echo [3] Stop all Node.js server processes
echo [4] Exit this launcher window
echo.
set /p choice="Select an option (1-4): "

if "%choice%"=="1" (
    start http://localhost:5173
    echo Opened Frontend.
    echo.
    goto MENU
)
if "%choice%"=="2" (
    start http://localhost:5000/api/health
    echo Opened Health Check.
    echo.
    goto MENU
)
if "%choice%"=="3" (
    echo Stopping Node.js processes...
    taskkill /f /im node.exe >nul 2>nul
    echo All Node.js processes stopped.
    echo.
    goto MENU
)
if "%choice%"=="4" (
    exit /b 0
)

echo Invalid choice. Please enter 1, 2, 3, or 4.
echo.
goto MENU
