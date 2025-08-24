@echo off
echo 🚀 PingBoard Local Setup Script
echo ================================

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed. Please install Python 3.8+ first.
    pause
    exit /b 1
)

echo ✅ Python found
python --version

REM Check if we're in the right directory
if not exist "backend\manage.py" (
    echo ❌ Please run this script from the PingBoard root directory
    pause
    exit /b 1
)

echo ✅ Found Django project

REM Set up backend
echo.
echo 🔧 Setting up backend...
cd backend

REM Create virtual environment
if not exist "venv" (
    echo 📦 Creating virtual environment...
    python -m venv venv
) else (
    echo ✅ Virtual environment already exists
)

REM Activate virtual environment
echo 🔌 Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo 📚 Installing Python dependencies...
pip install -r requirements-local.txt

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo ⚙️ Creating .env file...
    (
        echo # Django Backend Configuration
        echo DEBUG=True
        echo SECRET_KEY=your-super-secret-key-change-this-in-production
        echo ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
        echo.
        echo # Database Configuration
        echo USE_POSTGRES=false
        echo POSTGRES_DB=pingboard
        echo POSTGRES_USER=pingboard_user
        echo POSTGRES_PASSWORD=pingboard_password
        echo POSTGRES_HOST=db
        echo POSTGRES_PORT=5432
        echo.
        echo # Frontend Configuration
        echo NEXT_PUBLIC_API_URL=http://localhost:8000
    ) > .env
    echo ✅ Created .env file
) else (
    echo ✅ .env file already exists
)

REM Run migrations
echo 🗄️ Running database migrations...
python manage.py migrate

REM Create superuser
echo.
echo 👤 Creating superuser account...
echo Please enter your admin credentials:
python manage.py createsuperuser

echo.
echo 🎉 Setup complete!
echo.
echo To start PingBoard:
echo 1. cd backend
echo 2. venv\Scripts\activate.bat
echo 3. python manage.py runserver 0.0.0.0:8000
echo.
echo Access your app at:
echo - Local: http://localhost:8000
echo - Network: http://%COMPUTERNAME%:8000
echo.
echo Admin panel: http://localhost:8000/admin/

pause
