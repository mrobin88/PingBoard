#!/bin/bash

echo "🚀 Starting PingBoard..."
echo "========================"

# Check if we're in the right directory
if [ ! -f "backend/manage.py" ]; then
    echo "❌ Please run this script from the PingBoard root directory"
    exit 1
fi

# Navigate to backend
cd backend

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Please run setup-local.sh first."
    exit 1
fi

# Activate virtual environment
echo "🔌 Activating virtual environment..."
source venv/bin/activate

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please run setup-local.sh first."
    exit 1
fi

# Get local IP address
LOCAL_IP=$(hostname -I | awk '{print $1}')

echo "✅ Starting PingBoard server..."
echo "🌐 Local access: http://localhost:8000"
echo "🌐 Network access: http://$LOCAL_IP:8000"
echo "🔧 Admin panel: http://localhost:8000/admin/"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Start Django server
python manage.py runserver 0.0.0.0:8000
