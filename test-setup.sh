#!/bin/bash

echo "🧪 Testing PingBoard Setup..."

# Check if services are running
echo "📊 Checking service status..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ All services are running"
else
    echo "❌ Some services are not running"
    docker-compose ps
    exit 1
fi

# Test backend API
echo "🔌 Testing backend API..."
sleep 5  # Wait for services to be fully ready

if curl -s http://localhost:8000/api/ > /dev/null; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

# Test frontend
echo "🌐 Testing frontend..."
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

# Test database connection
echo "🗄️ Testing database connection..."
if docker-compose exec -T db pg_isready -U pingboard_user > /dev/null 2>&1; then
    echo "✅ Database is accessible"
else
    echo "❌ Database is not accessible"
fi

# Check logs for errors
echo "📋 Checking for errors in logs..."
ERROR_COUNT=$(docker-compose logs 2>&1 | grep -i "error\|exception\|traceback" | wc -l)

if [ $ERROR_COUNT -eq 0 ]; then
    echo "✅ No errors found in logs"
else
    echo "⚠️ Found $ERROR_COUNT potential errors in logs"
    echo "Check logs with: docker-compose logs"
fi

echo ""
echo "🎯 Quick Access URLs:"
echo "   Frontend: http://localhost:3000"
echo "   Backend: http://localhost:8000"
echo "   Admin: http://localhost:8000/admin"
echo ""
echo "📊 View logs: docker-compose logs -f"
echo "🛑 Stop: docker-compose down"
echo ""
echo "🎉 Setup test completed!"
