#!/bin/bash

echo "🚀 PingBoard Local Setup Script"
echo "================================"

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ first."
    exit 1
fi

echo "✅ Python 3 found: $(python3 --version)"

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Please run this script from the PingBoard root directory"
    exit 1
fi

echo "✅ Found Django project"

# Set up backend
echo ""
echo "🔧 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
else
    echo "✅ Virtual environment already exists"
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements-local.txt

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "⚙️ Creating .env file..."
    cat > .env << EOF
# Django Backend Configuration
DEBUG=True
SECRET_KEY=your-super-secret-key-change-this-in-production
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0

# Database Configuration
USE_POSTGRES=false
POSTGRES_DB=pingboard
POSTGRES_USER=pingboard_user
POSTGRES_PASSWORD=pingboard_password
POSTGRES_HOST=db
POSTGRES_PORT=5432

# Frontend Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo "✅ Created .env file"
else
    echo "✅ .env file already exists"
fi

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate

# Create superuser
echo ""
echo "👤 Creating superuser account..."
echo "Please enter your admin credentials:"
python manage.py createsuperuser

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start PingBoard:"
echo "1. cd backend"
echo "2. source venv/bin/activate"
echo "3. python manage.py runserver 0.0.0.0:8000"
echo ""
echo "Access your app at:"
echo "- Local: http://localhost:8000"
echo "- Network: http://$(hostname -I | awk '{print $1}'):8000"
echo ""
echo "Admin panel: http://localhost:8000/admin/"
