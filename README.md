# Wind Power Plant Status Investigation Application

A full-stack web application for managing wind power plant inspection projects, checkup statuses, and documentation.

## Technology Stack

- **Backend**: Node.js with Fastify, TypeScript
- **Frontend**: React with TypeScript, Vite
- **Database**: PostgreSQL
- **Authentication**: JWT (fastify-jwt)
- **PDF Generation**: Puppeteer
- **File Storage**: Local filesystem

## Project Structure

```
.
├── backend/          # Backend API server
│   ├── src/
│   │   ├── routes/  # API route handlers
│   │   ├── services/ # Business logic
│   │   ├── middleware/ # Auth middleware
│   │   ├── migrations/ # Database migrations
│   │   └── config/  # Configuration files
│   └── package.json
├── frontend/         # React frontend application
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── contexts/ # React contexts
│   │   ├── services/ # API service layer
│   │   └── types/    # TypeScript types
│   └── package.json
└── specs/           # Project specifications

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+
- Docker and Docker Compose (optional)

### Local Development Setup

1. **Clone the repository**

2. **Set up the database**
   ```bash
   # Create PostgreSQL database
   createdb windpower
   ```

3. **Configure backend environment**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

5. **Run database migrations**
   ```bash
   cd backend
   npm run migrate
   ```

6. **Start backend server**
   ```bash
   cd backend
   npm run dev
   ```

7. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

8. **Start frontend development server**
   ```bash
   cd frontend
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Docker Setup

1. **Build and start all services**
   ```bash
   docker-compose up -d
   ```

2. **View logs**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services**
   ```bash
   docker-compose down
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Projects
- `GET /api/projects` - List user's projects
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details

### Checkups
- `PUT /api/projects/:id/checkups/:checkupId/status` - Update checkup status

### Documentation
- `GET /api/projects/:id/parts/:partId/documentation` - Get documentation metadata
- `POST /api/projects/:id/parts/:partId/documentation` - Upload documentation file
- `DELETE /api/projects/:id/documentation/:documentationId` - Delete documentation
- `GET /api/projects/:id/documentation/:documentationId/file` - Download file

### Powerplants
- `GET /api/powerplants` - List all powerplants
- `GET /api/powerplants/:id` - Get powerplant details

### Reports
- `POST /api/projects/:id/finish` - Finish project and generate PDF
- `GET /api/projects/:id/report` - Download PDF report

### Health
- `GET /api/health` - Health check endpoint

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/windpower
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d
FILE_STORAGE_PATH=./storage
PORT=3000
NODE_ENV=development
```

## Features

- User authentication and registration
- Project management
- Checkup status tracking (bad/average/good)
- Documentation file upload and management
- PDF report generation
- Responsive UI design

## Development

### Backend Development
```bash
cd backend
npm run dev  # Start with nodemon
npm run build  # Build TypeScript
npm start  # Run production build
```

### Frontend Development
```bash
cd frontend
npm run dev  # Start Vite dev server
npm run build  # Build for production
npm run preview  # Preview production build
```

## License

ISC
