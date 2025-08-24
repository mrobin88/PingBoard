# 🚀 PingBoard Deployment Guide

This guide will help you deploy PingBoard to production on a VPS or cloud provider.

## 📋 Prerequisites

- VPS with Ubuntu 20.04+ (minimum 1GB RAM, 20GB storage)
- Domain name (optional but recommended)
- SSH access to your server
- Docker and Docker Compose installed

## 🏗️ Server Setup

### 1. Update System
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y curl wget git
```

### 2. Install Docker
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Install Docker Compose
```bash
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

## 📦 Application Deployment

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd PingBoard
```

### 2. Configure Environment
```bash
cp env.example .env
nano .env
```

Update the following variables:
```bash
DEBUG=0
SECRET_KEY=your-super-secure-production-secret-key
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
NEXT_PUBLIC_API_URL=https://yourdomain.com

# Database (use strong passwords in production)
POSTGRES_PASSWORD=your-strong-database-password
```

### 3. Deploy with Docker Compose
```bash
# Build and start services
docker-compose -f docker-compose.prod.yml up -d --build

# Check status
docker-compose -f docker-compose.prod.yml ps

# View logs
docker-compose -f docker-compose.prod.yml logs -f
```

### 4. Run Database Migrations
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
docker-compose -f docker-compose.prod.yml exec backend python manage.py collectstatic --noinput
```

### 5. Create Admin User
```bash
docker-compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

## 🔒 SSL/HTTPS Setup

### Option 1: Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Option 2: Cloudflare (Free)
1. Add your domain to Cloudflare
2. Update nameservers
3. Enable SSL/TLS encryption mode: "Full (strict)"
4. Create DNS records pointing to your server IP

## 🌐 Nginx Configuration

Create `/etc/nginx/sites-available/pingboard`:
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
    
    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Admin panel
    location /admin/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/pingboard /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 Maintenance

### Update Application
```bash
git pull origin main
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
docker-compose -f docker-compose.prod.yml exec backend python manage.py migrate
```

### Backup Database
```bash
# Create backup
docker-compose -f docker-compose.prod.yml exec db pg_dump -U pingboard_user pingboard > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose -f docker-compose.prod.yml exec -T db psql -U pingboard_user pingboard < backup_file.sql
```

### Monitor Logs
```bash
# All services
docker-compose -f docker-compose.prod.yml logs -f

# Specific service
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

## 🚨 Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443
   ```

2. **Permission denied**
   ```bash
   sudo chown -R $USER:$USER .
   ```

3. **Database connection failed**
   ```bash
   docker-compose -f docker-compose.prod.yml logs db
   ```

4. **Frontend not loading**
   ```bash
   docker-compose -f docker-compose.prod.yml logs frontend
   ```

### Performance Tuning

1. **Database optimization**
   ```bash
   # Add to postgresql.conf
   shared_buffers = 256MB
   effective_cache_size = 1GB
   ```

2. **Nginx caching**
   ```nginx
   # Add to nginx config
   location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
       expires 1y;
       add_header Cache-Control "public, immutable";
   }
   ```

## 📊 Monitoring

### Basic Monitoring
```bash
# System resources
htop
df -h
free -h

# Docker resources
docker stats
docker system df
```

### Log Rotation
```bash
sudo nano /etc/logrotate.d/docker
```

Add:
```
/var/lib/docker/containers/*/*.log {
    rotate 7
    daily
    compress
    size=1M
    missingok
    delaycompress
    copytruncate
}
```

## 🔐 Security Checklist

- [ ] Strong SECRET_KEY
- [ ] DEBUG=False
- [ ] Strong database passwords
- [ ] SSL/HTTPS enabled
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Database backups
- [ ] Access logs monitoring

## 📞 Support

If you encounter issues:
1. Check the logs: `docker-compose logs -f`
2. Verify environment variables
3. Check network connectivity
4. Review this deployment guide
5. Create an issue on GitHub

---

Happy deploying! 🎉
