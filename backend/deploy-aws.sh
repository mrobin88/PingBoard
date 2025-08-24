#!/bin/bash

# AWS Deployment Script for PingBoard
echo "🚀 Deploying PingBoard to AWS..."

# Update system
echo "📦 Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Python and dependencies
echo "🐍 Installing Python and dependencies..."
sudo apt-get install -y python3 python3-pip python3-venv nginx postgresql-client

# Create app directory
echo "📁 Setting up application directory..."
sudo mkdir -p /opt/pingboard
sudo chown $USER:$USER /opt/pingboard

# Copy application files
echo "📋 Copying application files..."
cp -r . /opt/pingboard/
cd /opt/pingboard

# Create virtual environment
echo "🔧 Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
echo "📚 Installing Python dependencies..."
pip install -r requirements-prod.txt

# Collect static files
echo "🎨 Collecting static files..."
python manage.py collectstatic --noinput --settings=pingboard.settings-prod

# Run migrations
echo "🗄️ Running database migrations..."
python manage.py migrate --settings=pingboard.settings-prod

# Create superuser (optional)
echo "👤 Creating superuser..."
python manage.py createsuperuser --settings=pingboard.settings-prod

# Set up Gunicorn service
echo "🔄 Setting up Gunicorn service..."
sudo tee /etc/systemd/system/pingboard.service > /dev/null <<EOF
[Unit]
Description=PingBoard Django Application
After=network.target

[Service]
User=$USER
Group=$USER
WorkingDirectory=/opt/pingboard
Environment="PATH=/opt/pingboard/venv/bin"
ExecStart=/opt/pingboard/venv/bin/gunicorn --workers 3 --bind unix:/opt/pingboard/pingboard.sock pingboard.wsgi-prod:application
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Start and enable Gunicorn service
echo "🚀 Starting Gunicorn service..."
sudo systemctl daemon-reload
sudo systemctl start pingboard
sudo systemctl enable pingboard

# Set up Nginx
echo "🌐 Setting up Nginx..."
sudo tee /etc/nginx/sites-available/pingboard > /dev/null <<EOF
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /opt/pingboard;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/opt/pingboard/pingboard.sock;
    }
}
EOF

# Enable site and restart Nginx
echo "🔄 Enabling Nginx site..."
sudo ln -s /etc/nginx/sites-available/pingboard /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx

echo "✅ Deployment complete!"
echo "🌐 Your app should be accessible at: http://your-domain.com"
echo "🔧 Check status with: sudo systemctl status pingboard"
echo "📝 View logs with: sudo journalctl -u pingboard"
