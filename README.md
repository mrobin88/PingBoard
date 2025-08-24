# 🚀 PingBoard - Local Social Network Platform

**PingBoard** is a lightweight, self-hosted social networking platform designed for local offices, communities, and organizations. Think of it as a mini-Reddit that you control completely.

## ✨ Features

- **Simple Posting**: 280-character messages with hashtag support
- **User Authentication**: Secure login/registration system
- **SEO Optimization**: Automatic meta tag generation for hashtag posts
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Local Network Ready**: Accessible from any device on your network
- **Zero External Dependencies**: Everything runs on your own hardware

## 🎯 Perfect For

- **Office Communication**: Team updates, announcements, discussions
- **Local Communities**: Neighborhood groups, clubs, organizations
- **Educational Institutions**: Student forums, class discussions
- **Small Businesses**: Internal communication, customer feedback
- **Privacy-Conscious Groups**: Complete data control, no third-party tracking

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Python 3.8+ 
- Git
- Modern web browser

### 1. Clone the Repository
```bash
git clone https://github.com/mrobin88/PingBoard.git
cd PingBoard
```

### 2. Set Up Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements-local.txt
```

### 3. Run the Application
```bash
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### 4. Access Your App
- **From your computer**: http://localhost:8000
- **From other devices**: http://YOUR_IP_ADDRESS:8000

## 🌐 Network Access Setup

### Find Your IP Address
**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```cmd
ipconfig | findstr "IPv4"
```

### Make It Accessible to Your Network
1. **Start Django with network binding:**
   ```bash
   python manage.py runserver 0.0.0.0:8000
   ```

2. **Access from other devices:**
   - Same WiFi network: `http://YOUR_IP:8000`
   - Example: `http://192.168.1.100:8000`

### Port Forwarding (Optional - Internet Access)
**⚠️ Security Warning**: Only do this if you understand the risks!

1. **Find your router's admin page** (usually 192.168.1.1)
2. **Set up port forwarding** for port 8000
3. **Use a dynamic DNS service** (like No-IP) for a custom URL
4. **Consider using HTTPS** for security

## 🏗️ Production Deployment

### For Offices/Organizations
1. **Dedicated Server**: Use a spare computer or small server
2. **Database**: Switch to PostgreSQL for better performance
3. **Web Server**: Use Nginx + Gunicorn for production
4. **SSL Certificate**: Get a free certificate from Let's Encrypt

### For AWS/Cloud (Advanced)
- Use the included `deploy-aws.sh` script
- Set up RDS PostgreSQL database
- Configure security groups and load balancers

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the `backend` directory:

```bash
# Django Settings
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1,YOUR_IP_ADDRESS

# Database (SQLite for local, PostgreSQL for production)
USE_POSTGRES=false
POSTGRES_DB=pingboard
POSTGRES_USER=pingboard_user
POSTGRES_PASSWORD=your-password
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
```

### Customization
- **Branding**: Edit templates in `frontend_templates/templates/`
- **Styling**: Modify Tailwind CSS classes
- **Features**: Add new models in `pings/models.py`

## 📱 User Guide

### For End Users
1. **Register**: Create an account with username/password
2. **Login**: Access your personalized dashboard
3. **Post**: Share messages up to 280 characters
4. **Use Hashtags**: Add `#topic` for better organization
5. **Browse**: View posts from all users in chronological order

### For Administrators
1. **Access Admin**: http://localhost:8000/admin/
2. **Manage Users**: Create, edit, or deactivate accounts
3. **Moderate Content**: Review and manage posts
4. **View Analytics**: Monitor user activity and engagement

## 🛡️ Security Features

- **CSRF Protection**: Built-in Django security
- **Password Validation**: Strong password requirements
- **Session Management**: Secure user sessions
- **Input Sanitization**: XSS protection
- **SQL Injection Protection**: Django ORM security

## 🔍 Troubleshooting

### Common Issues

**"DisallowedHost" Error:**
- Add your IP address to `ALLOWED_HOSTS` in settings
- Restart the Django server

**Can't Access from Other Devices:**
- Ensure devices are on the same network
- Check firewall settings
- Verify Django is running on `0.0.0.0:8000`

**Database Errors:**
- Run `python manage.py migrate`
- Check database configuration in `.env`

### Performance Tips
- **Small Office (< 50 users)**: Current setup is fine
- **Medium Office (50-200 users)**: Consider PostgreSQL
- **Large Office (200+ users)**: Use production deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🆘 Support

- **Issues**: Report bugs on GitHub
- **Questions**: Open a discussion
- **Feature Requests**: Submit an issue with enhancement label

## 🎉 Success Stories

*"We deployed PingBoard in our 25-person office and it's revolutionized our internal communication. No more email chains!"* - Tech Startup CEO

*"Our neighborhood association uses PingBoard to coordinate events and share local news. It's perfect for community building."* - Community Organizer

---

**Built with ❤️ using Django, Python, and Tailwind CSS**

**Ready to build your own social network? Start with PingBoard today!**
