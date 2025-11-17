# Wind Power Plant Status Investigation Application

A full-stack web application for managing wind power plant inspection projects. Field technicians can create projects, track checkup statuses, and generate PDF reports.

## Tech Stack

### Backend
- **Node.js 20.x LTS** - Runtime environment
- **Fastify 4.24.x** - Web framework
- **TypeScript 5.3.x** - Type safety
- **Prisma 5.7.x** - ORM and database toolkit
- **PostgreSQL 15.x** - Database
- **bcrypt 5.1.x** - Password hashing
- **pdfkit 0.14.x** - PDF generation
- **sharp 0.33.x** - Image processing
- **zod 3.22.x** - Input validation

### Frontend
- **React 18.2.x** - UI library
- **TypeScript** - Type safety
- **Vite 5.0.x** - Build tool
- **react-router-dom 6.20.x** - Routing
- **axios 1.6.x** - HTTP client

## Prerequisites

- Node.js 20.x or higher
- PostgreSQL 15.x or higher
- npm or yarn package manager

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
```

### 2. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE wind_power_plant;
```

2. Copy the environment file:
```bash
cp .env.example .env
```

3. Update `.env` with your database connection:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/wind_power_plant?schema=public"
```

4. Generate Prisma client:
```bash
npm run db:generate
```

5. Run database migrations:
```bash
npm run db:migrate
```

### 3. Environment Variables

Update `.env` with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/wind_power_plant?schema=public"

# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Session
SESSION_SECRET=change-this-to-a-random-secret-in-production

# Security
COOKIE_SECURE=false
COOKIE_SAME_SITE=strict
```

**Important**: Change `SESSION_SECRET` to a random string in production.

### 4. Development

Start both backend and frontend in development mode:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend development server on `http://localhost:3000`

Or start them separately:

```bash
# Backend only
npm run dev:backend

# Frontend only
npm run dev:frontend
```

### 5. Production Build

Build the application:

```bash
npm run build
```

Start the production server:

```bash
npm start
```

## Project Structure

```
/workspace
├── prisma/
│   └── schema.prisma          # Database schema
├── src/
│   ├── backend/
│   │   ├── middleware/        # Authentication, error handling
│   │   ├── routes/            # API route handlers
│   │   ├── services/          # Business logic
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # Utilities (logger, errors, security)
│   │   ├── validation/        # Zod validation schemas
│   │   └── server.ts          # Fastify server setup
│   └── frontend/
│       ├── components/       # React components
│       ├── hooks/             # Custom React hooks
│       ├── pages/             # Page components
│       ├── services/          # API client
│       ├── types/             # TypeScript types
│       ├── App.tsx            # Main app component
│       └── main.tsx           # Entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User authentication
- `POST /api/auth/logout` - Session termination

### Projects
- `GET /api/projects` - List user's projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create new project
- `PATCH /api/projects/:id/checkups/:checkupId/status` - Update checkup status
- `POST /api/projects/:id/finish` - Finish project and generate PDF

### Powerplants
- `GET /api/powerplants` - List all powerplants
- `GET /api/powerplants/:id/parts` - Get powerplant parts and checkups

### Health
- `GET /api/health` - Health check endpoint

## Features

- **User Authentication**: Secure session-based authentication with HTTP-only cookies
- **Project Management**: Create and manage inspection projects
- **Status Tracking**: Set status (bad/average/good) for each checkup
- **PDF Reports**: Generate comprehensive PDF reports when finishing projects
- **Documentation**: View documentation text and images for checkups
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Security Features

- Password hashing with bcrypt (10 salt rounds)
- Session-based authentication with secure cookies
- SQL injection prevention (Prisma ORM)
- XSS prevention (React auto-escaping)
- Input validation with Zod
- User isolation (users can only access their own projects)
- Security headers on all responses
- Rate limiting (100 requests per minute)

## Database Schema

The application uses the following main entities:
- **users** - User accounts
- **powerplants** - Wind power installations
- **parts** - Wind turbine components
- **checkups** - Inspection points
- **projects** - Investigation assignments
- **checkup_statuses** - Checkup evaluation records

See `prisma/schema.prisma` for the complete schema definition.

## Development Scripts

- `npm run dev` - Start both backend and frontend in development mode
- `npm run dev:backend` - Start backend only
- `npm run dev:frontend` - Start frontend only
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Prisma Studio
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Testing

Unit tests and E2E tests are handled separately by the testing agent. See the `specs/` directory for test specifications.

## Performance Requirements

- Authentication endpoints: < 500ms
- GET endpoints (list): < 500ms
- GET endpoints (single): < 1s
- POST endpoints (create): < 500ms
- PATCH endpoints (update): < 300ms
- POST /api/projects/:id/finish: < 5s (includes PDF generation)

## Error Handling

All errors are handled gracefully with user-friendly messages. Detailed error information is logged server-side for debugging. Never expose internal details (stack traces, database errors) to users.

## Logging

All logs are in JSON format:
```json
{
  "timestamp": "2024-01-15T10:30:00.123Z",
  "level": "INFO",
  "message": "User logged in successfully",
  "context": {
    "userId": "...",
    "username": "..."
  }
}
```

## License

This project is proprietary software.

## Support

For issues or questions, please contact the development team.
