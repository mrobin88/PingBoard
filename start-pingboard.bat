@echo off
echo 🚀 Starting PingBoard...
echo ========================

REM Check if we're in the right directory
if not exist "backend\manage.py" (
    echo ❌ Please run this script from the PingBoard root directory
    pause
    exit /b 1
)

REM Navigate to backend
cd backend

REM Check if virtual environment exists
if not exist "venv" (
    echo ❌ Virtual environment not found. Please run setup-local.bat first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please run setup-local.bat first.
    pause
    exit /b 1
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

echo ✅ Starting PingBoard server...
echo 🌐 Local access: http://localhost:8000
echo 🌐 Network access: http://%COMPUTERNAME%:8000
echo 🔧 Admin panel: http://localhost:8000/admin/
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start Django server
python manage.py runserver 0.0.0.0:8000

pause
