# PingBoard 🚀

A full-stack web application for sharing short messages (pings) with your community. Built with Django backend and Next.js frontend, featuring a clean Twitter-like interface with modern UX.

## ✨ Features

### Core Functionality
- **User Authentication**: Secure email + password login/registration
- **Ping Creation**: Share messages up to 280 characters
- **Categories**: Organize pings by type (event, sale, help, misc)
- **Location Support**: Add city or zip code to your pings
- **Anonymous Posting**: Post anonymously while maintaining account linkage
- **Voting System**: Upvote/downvote pings from the community

### User Experience
- **Responsive Design**: Mobile-first, works on all devices
- **Real-time Updates**: Automatic refresh and live notifications
- **Search & Filtering**: Find pings by text, category, or location
- **Infinite Scroll**: Seamless browsing through the ping feed
- **Clean Interface**: Minimal, Twitter-inspired design

### Technical Features
- **JWT Authentication**: Secure token-based auth with refresh
- **RESTful API**: Clean Django REST Framework backend
- **PostgreSQL Database**: Robust data storage
- **Docker Ready**: Easy deployment with Docker Compose
- **Production Ready**: Environment variables, security best practices

## 🏗️ Architecture

```
PingBoard/
├── backend/                 # Django REST API
│   ├── pingboard/          # Main Django project
│   ├── users/              # Custom user management
│   ├── pings/              # Ping model and API
│   └── requirements.txt    # Python dependencies
├── frontend/               # Next.js application
│   ├── app/               # App router pages
│   ├── components/        # Reusable React components
│   ├── contexts/          # React contexts (auth, etc.)
│   ├── lib/               # API utilities and helpers
│   └── package.json       # Node.js dependencies
└── docker-compose.yml     # Multi-service orchestration
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### 1. Clone and Setup
```bash
git clone <repository-url>
cd PingBoard
```

### 2. Start with Docker (Recommended)
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### 3. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin
- **Database**: localhost:5432

## 🛠️ Local Development

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
export DEBUG=1
export SECRET_KEY=your-secret-key
export DATABASE_URL=postgresql://pingboard_user:pingboard_password@localhost:5432/pingboard

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

### Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
export NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
DEBUG=1
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=postgresql://user:password@host:port/dbname
ALLOWED_HOSTS=localhost,127.0.0.1
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Database Configuration
The application uses PostgreSQL by default. You can modify the database settings in `backend/pingboard/settings.py` or use environment variables.

## 📱 API Endpoints

### Authentication
- `POST /api/token/` - Login
- `POST /api/token/refresh/` - Refresh token
- `POST /api/users/register/` - User registration

### Users
- `GET /api/users/profile/` - Get user profile
- `PATCH /api/users/profile/` - Update profile
- `POST /api/users/change-password/` - Change password

### Pings
- `GET /api/pings/` - List all pings (with filters)
- `POST /api/pings/` - Create new ping
- `GET /api/pings/{id}/` - Get specific ping
- `PATCH /api/pings/{id}/` - Update ping
- `DELETE /api/pings/{id}/` - Delete ping
- `POST /api/pings/{id}/vote/` - Vote on ping
- `GET /api/pings/user/` - Get user's pings

## 🚀 Deployment

### Production Deployment
1. **Update Environment Variables**
   ```bash
   DEBUG=0
   SECRET_KEY=your-production-secret-key
   ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
   ```

2. **Build and Deploy**
   ```bash
   # Build production images
   docker-compose -f docker-compose.prod.yml build
   
   # Deploy
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **SSL/HTTPS**: Use a reverse proxy (nginx) with Let's Encrypt

### VPS Deployment
- Minimum: 1GB RAM, 20GB storage
- Recommended: 2GB RAM, 40GB storage
- OS: Ubuntu 20.04+ or similar

## 🔒 Security Features

- JWT token authentication
- Password validation and hashing
- CORS protection
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting (can be added)

## 🧪 Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests (when implemented)
cd frontend
npm test
```

## 📊 Performance

- Database indexing on frequently queried fields
- React Query for efficient data fetching
- Optimized images and assets
- Lazy loading and code splitting
- CDN ready for static assets

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **Issues**: Create an issue on GitHub
- **Documentation**: Check the code comments and API docs
- **Community**: Join our discussions

## 🔮 Roadmap

- [ ] Real-time notifications
- [ ] Image uploads for pings
- [ ] User mentions and replies
- [ ] Advanced search with Elasticsearch
- [ ] Mobile app (React Native)
- [ ] API rate limiting
- [ ] Webhook support
- [ ] Analytics dashboard

---

Built with ❤️ using Django, Next.js, and Tailwind CSS
