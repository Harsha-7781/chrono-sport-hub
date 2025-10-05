# Sports Scheduler Web Application

A comprehensive web application for managing sports sessions and activities with role-based access control.

## 🚀 Features

### Authentication & Authorization
- **Email/password authentication** with JWT tokens
- **Role-based access control** (Admin & Player roles)
- Secure user registration and login

### Admin Features
- **Sports Management**: Create, edit, and delete sports categories
- **Session Oversight**: View all sessions and manage activities
- **Reports & Analytics**: Track user engagement and session statistics
- **User Management**: Monitor player activities

### Player Features
- **Session Discovery**: Browse and join available sports sessions
- **Session Creation**: Create new sessions for other players to join
- **Session Management**: Leave sessions with cancellation reasons
- **Personal Dashboard**: Track created and joined sessions

### Core Functionality
- **Smart Session Logic**: Prevents joining past sessions
- **Capacity Management**: Shows available slots and joined players
- **Real-time Updates**: Live session status and player counts
- **Responsive Design**: Dark theme with gold/purple/blue accents

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development and building
- **Tailwind CSS** for styling
- **shadcn/ui** components
- **React Query** for state management
- **React Router** for navigation

### Backend (To be implemented)
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database operations
- **PostgreSQL** database
- **bcrypt** for password hashing
- **JWT** for authentication tokens

## 🎨 Design System

### Color Palette
- **Background**: #121212 / #1A1A1A
- **Gold Accent**: #DAA520
- **Deep Purple**: #673AB7
- **Electric Blue**: #1E90FF / #004D61
- **Text**: #F0F0F0

### Button Design
- **Default**: Purple/Blue with gold text
- **Hover**: Lighter/darker shades
- **Active**: Gold/blue borders with opacity overlays

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database (for backend)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repository-url>
cd sports-scheduler
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
cp .env.example .env
# Edit .env with your database and JWT configuration
```

4. **Run database migrations** (when backend is implemented)
```bash
npm run db:migrate
npm run db:seed
```

5. **Start development servers**
```bash
# Frontend (Vite dev server)
npm run dev

# Backend (when implemented)
npm run server:dev
```

### Docker Support

```bash
# Start the application with Docker Compose
docker-compose up -d

# Stop the application
docker-compose down
```

## 📝 Available Scripts

### Frontend
- `npm run dev` - Start Vite development server
- `npm run build` - Build production bundle
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Backend (To be implemented)
- `npm run server:dev` - Start Express server with nodemon
- `npm run server:build` - Build TypeScript to JavaScript
- `npm run server:start` - Start production server
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with sample data

## 🔐 Demo Accounts

For development and testing:

**Admin Account**
- Email: `admin@sports.com`
- Password: `admin123`

**Player Account**
- Email: `player@sports.com`  
- Password: `player123`

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('admin', 'player')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sports Table
```sql
CREATE TABLE sports (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  description TEXT,
  max_players INTEGER NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  sport_id UUID REFERENCES sports(id),
  title VARCHAR NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration INTEGER NOT NULL,
  max_players INTEGER NOT NULL,
  location VARCHAR NOT NULL,
  created_by UUID REFERENCES users(id),
  status VARCHAR DEFAULT 'upcoming',
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Session Players Table
```sql
CREATE TABLE session_players (
  id UUID PRIMARY KEY,
  session_id UUID REFERENCES sessions(id),
  user_id UUID REFERENCES users(id),
  joined_at TIMESTAMP DEFAULT NOW(),
  status VARCHAR DEFAULT 'joined',
  cancellation_reason TEXT,
  UNIQUE(session_id, user_id)
);
```

## 🔒 Security Features

- **Password hashing** with bcrypt
- **JWT token authentication**
- **Role-based route protection**
- **Input validation** and sanitization
- **SQL injection prevention** with Prisma
- **CORS configuration**
- **Rate limiting** (to be implemented)

## 📱 Responsive Design

- **Mobile-first** approach
- **Responsive breakpoints**: sm, md, lg, xl
- **Touch-friendly** interface elements
- **Dark theme** optimized for all devices

## 🧪 Testing Strategy

- **Unit tests** with Jest
- **Integration tests** for API endpoints
- **End-to-end tests** with Playwright
- **Component tests** with React Testing Library

## 🚀 Deployment

### Frontend Deployment
```bash
npm run build
# Deploy dist/ folder to your hosting provider
```

### Backend Deployment
```bash
npm run server:build
# Deploy to your server with Docker or Node.js
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Lucide React** for the icon system
- **React Query** for data fetching and caching