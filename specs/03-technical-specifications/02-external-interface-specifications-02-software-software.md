# 2. External Interface Specifications (continued)

## 2.2 Software/Software Interface

### 2.2.1 Core Runtime Technologies

**Node.js**
- Version: 20.x LTS (latest)
- Source/Vendor: Node.js Foundation
- Purpose: JavaScript runtime for backend server
- Interface: Command-line execution, CommonJS and ES modules support
- Configuration: Environment variables for configuration

**npm**
- Version: 10.x (bundled with Node.js 20.x)
- Source/Vendor: npm, Inc.
- Purpose: Package manager for dependency management
- Interface: Command-line tool, package.json for dependency declaration
- Configuration: .npmrc for registry and authentication settings

**TypeScript**
- Version: 5.3.x (latest)
- Source/Vendor: Microsoft
- Purpose: Type-safe JavaScript for both backend and frontend
- Interface: Compiler (tsc), type definitions (.d.ts files)
- Configuration: tsconfig.json for compiler options

**Vite**
- Version: 5.0.x (latest)
- Source/Vendor: Evan You and Vite contributors
- Purpose: Module bundler and development server for frontend
- Interface: Command-line tool, vite.config.ts for configuration
- Configuration: vite.config.ts for build and dev server settings

**Docker**
- Version: 24.x (latest)
- Source/Vendor: Docker, Inc.
- Purpose: Containerization for deployment and development environment
- Interface: Docker CLI, Dockerfile for image definition, docker-compose.yml for orchestration
- Configuration: Dockerfile and docker-compose.yml

**Nodemon**
- Version: 3.0.x (latest)
- Source/Vendor: Remy Sharp
- Purpose: Development server with automatic restart on file changes
- Interface: Command-line tool, nodemon.json for configuration
- Configuration: nodemon.json for watch patterns and restart conditions

### 2.2.2 Backend Framework and Libraries

**Fastify**
- Version: 4.24.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Fast and low overhead web framework for API server
- Interface: HTTP server, route handlers, plugin system
- API Endpoints:
  - POST /api/auth/register - User registration
  - POST /api/auth/login - User authentication
  - POST /api/auth/logout - Session termination
  - GET /api/projects - List user's projects
  - GET /api/projects/:id - Get project details
  - POST /api/projects - Create new project
  - PATCH /api/projects/:id/checkups/:checkupId/status - Update checkup status
  - POST /api/projects/:id/finish - Finish project and generate PDF
  - GET /api/powerplants - List all powerplants
  - GET /api/powerplants/:id/parts - Get parts and checkups for powerplant

**@fastify/cookie**
- Version: 9.1.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Cookie parsing and serialization for session management
- Interface: Cookie plugin for Fastify, req.cookies and reply.setCookie()

**@fastify/session**
- Version: 10.7.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Session management with secure session storage
- Interface: req.session object for session data access
- Configuration: Session secret, cookie settings, store configuration

**@fastify/cors**
- Version: 8.4.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Cross-Origin Resource Sharing (CORS) support
- Interface: CORS plugin configuration for allowed origins and methods

**@fastify/multipart**
- Version: 8.0.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Multipart form data parsing (for future file uploads)
- Interface: req.isMultipart(), req.parts() for file handling

### 2.2.3 Database Technologies

**PostgreSQL**
- Version: 15.x (latest stable)
- Source/Vendor: PostgreSQL Global Development Group
- Purpose: Relational database for persistent data storage
- Interface: SQL queries, connection string format: postgresql://user:password@host:port/database
- Configuration: postgresql.conf for database settings, connection pooling

**Prisma**
- Version: 5.7.x (latest)
- Source/Vendor: Prisma Data
- Purpose: Type-safe ORM and database query builder
- Interface: Prisma Client API, Prisma Schema (schema.prisma)
- Configuration: schema.prisma for data model, .env for database connection
- API Methods:
  - prisma.user.create() - Create user
  - prisma.user.findUnique() - Find user by ID or unique field
  - prisma.project.findMany() - Query projects with filters
  - prisma.checkupStatus.upsert() - Create or update checkup status
  - prisma.$transaction() - Database transactions

**@prisma/client**
- Version: 5.7.x (latest, matches Prisma version)
- Source/Vendor: Prisma Data
- Purpose: TypeScript client for Prisma ORM
- Interface: Generated TypeScript types and query methods

### 2.2.4 Authentication and Security

**bcrypt**
- Version: 5.1.x (latest)
- Source/Vendor: npm package bcrypt
- Purpose: Password hashing using bcrypt algorithm
- Interface: bcrypt.hash(password, saltRounds), bcrypt.compare(password, hash)
- Configuration: Salt rounds set to 10

**@fastify/secure-session**
- Version: 5.0.x (latest)
- Source/Vendor: Fastify organization
- Purpose: Secure session storage with encryption
- Interface: req.session object with encrypted session data

### 2.2.5 Validation Libraries

**zod**
- Version: 3.22.x (latest)
- Source/Vendor: Colin McDonnell
- Purpose: TypeScript-first schema validation
- Interface: Schema definition with z.object(), schema.parse() for validation
- Usage: Request body validation, query parameter validation, environment variable validation

**@fastify/type-provider-typebox**
- Version: 3.1.x (latest)
- Source/Vendor: Fastify organization
- Purpose: TypeBox integration for Fastify type safety
- Interface: TypeBox schemas for route validation

### 2.2.6 PDF Generation

**pdfkit**
- Version: 0.14.x (latest)
- Source/Vendor: Devongovett
- Purpose: PDF document generation for project reports
- Interface: PDFDocument class, doc.text(), doc.image(), doc.end()
- Configuration: Page size (A4), margins, fonts, image embedding

### 2.2.7 Image Processing

**sharp**
- Version: 0.33.x (latest)
- Source/Vendor: Lovell Fuller
- Purpose: High-performance image processing and optimization
- Interface: sharp(buffer) for image manipulation, resize(), toBuffer()
- Usage: Image resizing, format conversion, optimization before storage

### 2.2.8 Frontend Framework and Libraries

**React**
- Version: 18.2.x (latest)
- Source/Vendor: Meta (Facebook)
- Purpose: User interface library for building interactive web applications
- Interface: JSX syntax, React hooks (useState, useEffect, useContext), component lifecycle
- Configuration: React.createElement() or JSX transpilation

**react-router-dom**
- Version: 6.20.x (latest)
- Source/Vendor: Remix Software
- Purpose: Client-side routing for single-page application
- Interface: BrowserRouter, Routes, Route, useNavigate(), useParams()
- Routes:
  - /login - Login screen
  - /register - Registration screen
  - /home - Home screen (projects list)
  - /projects/new - Start Project screen
  - /projects/:id - Ongoing Project screen

**axios**
- Version: 1.6.x (latest)
- Source/Vendor: Matt Zabriskie and contributors
- Purpose: HTTP client for API communication
- Interface: axios.get(), axios.post(), axios.patch(), interceptors for authentication
- Configuration: Base URL, timeout, request/response interceptors

### 2.2.9 Testing Frameworks

**Jest**
- Version: 29.7.x (latest)
- Source/Vendor: Meta (Facebook)
- Purpose: JavaScript testing framework for unit and integration tests
- Interface: describe(), test(), expect(), mocking with jest.mock()
- Configuration: jest.config.js for test environment and coverage settings

**@testing-library/react**
- Version: 14.1.x (latest)
- Source/Vendor: Kent C. Dodds and contributors
- Purpose: React component testing utilities
- Interface: render(), screen, fireEvent, waitFor()
- Usage: Component rendering, user interaction simulation, querying elements

**@testing-library/jest-dom**
- Version: 6.1.x (latest)
- Source/Vendor: Testing Library
- Purpose: Custom Jest matchers for DOM testing
- Interface: toBeInTheDocument(), toHaveTextContent(), toBeVisible()

**Playwright**
- Version: 1.40.x (latest)
- Source/Vendor: Microsoft
- Purpose: End-to-end testing framework for browser automation
- Interface: test(), page.goto(), page.click(), page.fill(), expect()
- Configuration: playwright.config.ts for browser settings and test options
- Browsers: Chromium, Firefox, WebKit

**@playwright/test**
- Version: 1.40.x (latest, matches Playwright version)
- Source/Vendor: Microsoft
- Purpose: Playwright test runner and API
- Interface: test() function, page object, expect assertions

### 2.2.10 Development Tools

**eslint**
- Version: 8.55.x (latest)
- Source/Vendor: ESLint contributors
- Purpose: JavaScript and TypeScript linting
- Interface: Command-line tool, .eslintrc.json for configuration
- Configuration: ESLint rules for code quality and style

**prettier**
- Version: 3.1.x (latest)
- Source/Vendor: Prettier contributors
- Purpose: Code formatting
- Interface: Command-line tool, .prettierrc for configuration
- Configuration: Prettier rules for consistent code formatting

**@types/node**
- Version: 20.10.x (latest, matches Node.js version)
- Source/Vendor: DefinitelyTyped
- Purpose: TypeScript type definitions for Node.js
- Interface: Type definitions for Node.js APIs

**@types/react**
- Version: 18.2.x (latest, matches React version)
- Source/Vendor: DefinitelyTyped
- Purpose: TypeScript type definitions for React
- Interface: Type definitions for React components and hooks

**@types/bcrypt**
- Version: 5.0.x (latest)
- Source/Vendor: DefinitelyTyped
- Purpose: TypeScript type definitions for bcrypt
- Interface: Type definitions for bcrypt functions

### 2.2.11 Environment Configuration

**dotenv**
- Version: 16.3.x (latest)
- Source/Vendor: Motdotla
- Purpose: Environment variable management from .env files
- Interface: require('dotenv').config() for loading environment variables
- Configuration: .env file for development, environment variables for production

### 2.2.12 Package Management

**package.json**
- Format: JSON file
- Purpose: Dependency declaration, scripts, project metadata
- Interface: npm install, npm run <script>, npm start, npm test
- Scripts:
  - dev: Development server with nodemon
  - build: Production build
  - start: Production server
  - test: Run Jest tests
  - test:e2e: Run Playwright tests
  - lint: Run ESLint
  - format: Run Prettier
