# ExamGuard — Full-Stack Quiz & Examination Platform

A comprehensive, full-stack web application for creating, managing, and attempting quizzes with role-based access control (Students, Teachers, Admins).

## Features

### Core Features ✅

- **User Authentication** — Secure login/signup with bcryptjs password hashing
- **Role-Based Access Control** — Student, Teacher, and Admin roles
- **Quiz Management** — Teachers can create, edit, and manage quizzes
- **Quiz Attempts** — Students can take quizzes and view results
- **Class Management** — Teachers manage classes and enroll students
- **User Profiles** — Users can update their profile information
- **Admin Dashboard** — Admins manage users and system settings
- **Real-time Feedback** — Toast notifications for all user actions
- **Session Management** — JWT tokens with optional "remember me" functionality

## Tech Stack

### Frontend

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Icons**: Lucide React
- **State Management**: React Context API
- **HTTP Client**: Axios

### Backend

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **CORS**: Enabled for cross-origin requests
- **Email**: Nodemailer

### Deployment

- **Hosting**: Vercel (serverless functions)
- **Database Hosting**: MongoDB Atlas
- **Environment**: Node.js 18+

## Project Structure

```
.
├── frontend/                  # React + TypeScript application
│   ├── src/
│   │   ├── components/       # Reusable React components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React Context (Auth, Toast)
│   │   ├── hooks/            # Custom hooks
│   │   ├── services/         # API client
│   │   └── utils/            # Utilities (validators, etc.)
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                   # Express.js API server
│   ├── controllers/          # Route handlers
│   ├── models/               # MongoDB schemas (Mongoose)
│   ├── routes/               # API route definitions
│   ├── middlewares/          # Auth, validation, error handling
│   ├── config/               # Database configuration
│   ├── utils/                # Helper functions
│   ├── app.js                # Express app setup
│   ├── server.js             # Server entry point
│   └── package.json
│
├── api/                       # Vercel serverless functions
│   └── [...slug].js          # Catch-all route for /api/*
│
├── package.json              # Root monorepo package.json
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

## Installation

### Prerequisites

- Node.js v18 or higher
- npm or yarn
- MongoDB (local or MongoDB Atlas)

### 1. Clone the Repository

```bash
git clone https://github.com/Umairishuman/Web-Project.git
cd Web-Project
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/examguard

# JWT
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
JWT_EXPIRE_REMEMBER=30d

# Email (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
SMTP_FROM=ExamGuard <noreply@examguard.com>

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:5173

# Node Environment
NODE_ENV=development
```

### 3. Install Backend Dependencies

```bash
cd backend
npm install
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
```

## Running Locally

### Start Backend Server

```bash
cd backend
npm run dev    # Development mode with nodemon
# or
npm start      # Production mode
```

Backend runs on `http://localhost:3000`

### Start Frontend Development Server

```bash
cd frontend
npm run dev
```

Frontend runs on `http://localhost:5173`

### Seed Admin Account (Optional)

```bash
cd backend
node utils/seedAdmin.js
```

Creates admin account: `admin@examguard.com` / `Admin@1234`

## API Endpoints

### Authentication

- `POST /api/auth/register` — Create a new user account
- `POST /api/auth/login` — Login with email and password
- `POST /api/auth/logout` — Logout (clears session)
- `GET /api/auth/me` — Get current authenticated user
- `POST /api/auth/forgot-password` — Request password reset
- `POST /api/auth/reset-password` — Reset password with token

### Quizzes

- `GET /api/quizzes` — Get all quizzes
- `POST /api/quizzes` — Create a new quiz (teacher only)
- `GET /api/quizzes/:id` — Get quiz details
- `PUT /api/quizzes/:id` — Update quiz (teacher only)
- `DELETE /api/quizzes/:id` — Delete quiz (teacher only)

### Quiz Attempts

- `POST /api/attempts` — Start a quiz attempt
- `PUT /api/attempts/:id` — Submit quiz attempt
- `GET /api/attempts/:id` — Get attempt details
- `GET /api/attempts` — Get user's attempts

### Classes

- `GET /api/classes` — Get all classes
- `POST /api/classes` — Create a class (teacher only)
- `GET /api/classes/:id` — Get class details
- `PUT /api/classes/:id` — Update class (teacher only)
- `POST /api/classes/:id/enroll` — Enroll in a class

### Users

- `GET /api/users/:id` — Get user profile
- `PUT /api/users/:id` — Update user profile
- `GET /api/users` — Get all users (admin only)

### Admin

- `GET /api/admin/stats` — Get system statistics (admin only)
- `DELETE /api/admin/users/:id` — Deactivate user (admin only)

## Authentication Flow

1. **Registration**
    - User submits name, email, password, and role
    - Backend validates and hashes password with bcryptjs
    - JWT token is generated and sent as HTTP-only cookie
    - User is logged in automatically

2. **Login**
    - User submits email and password
    - Backend verifies credentials using bcryptjs.compare()
    - JWT token is generated with optional 30-day expiry if "remember me" is checked
    - Frontend stores user data in localStorage and AuthContext

3. **Session Verification**
    - On app load, frontend calls `GET /api/auth/me`
    - Backend verifies JWT from cookie
    - If valid, user is restored from database
    - If invalid/expired, user is logged out

4. **Protected Routes**
    - Frontend checks `AuthContext.isAuthenticated` before rendering
    - Backend uses `authMiddleware` to verify JWT on protected endpoints
    - Role-based access control via `role.middleware.js`

## Deployment to Vercel

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Connect to Vercel

- Visit [vercel.com](https://vercel.com)
- Import your GitHub repository
- Vercel will auto-detect the `vercel.json` configuration

### 3. Set Environment Variables

In Vercel project settings, add:

- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRE`
- `JWT_EXPIRE_REMEMBER`
- `CLIENT_URL` (your Vercel deployment URL)
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

### 4. Deploy

The `vercel-build` script will:

1. Install all backend dependencies
2. Install all frontend dependencies
3. Build the frontend for production
4. The serverless function (`api/[...slug].js`) will handle all API requests

## Key Implementation Details

### Password Hashing

- **Library**: bcryptjs v2.4.3
- **Salt Rounds**: 10
- Passwords are hashed before saving to MongoDB via Mongoose pre-save hook
- Comparison uses `bcrypt.compare()` during login

### Session Management

- JWT tokens stored in HTTP-only cookies (secure on HTTPS)
- Tokens include user ID and optional 30-day expiry
- Frontend also maintains user state in AuthContext and localStorage
- Session verification via `GET /api/auth/me` on app startup

### Error Handling

- Global error middleware catches all exceptions
- Validation errors from express-validator
- Custom error responses with HTTP status codes
- User-friendly error messages in toast notifications

### CORS & Security

- CORS enabled for specified CLIENT_URL
- Credentials allowed (cookies)
- Trust proxy enabled for Vercel/Render
- Secure cookie options for HTTPS environments

## Development Scripts

### Backend

```bash
npm run dev     # Development mode with auto-reload
npm start       # Production mode
```

### Frontend

```bash
npm run dev     # Development server
npm run build   # Production build
npm run preview # Preview production build
npm run lint    # Run ESLint
```

### Root

```bash
npm run vercel-build  # Build for Vercel deployment
```

## Common Issues

### 404 Error on Vercel

**Solution**: Ensure the `vercel-build` script installs both frontend AND backend dependencies. The updated `package.json` now includes `npm install --include=dev` before building the frontend.

### CORS Errors

**Solution**: Make sure `CLIENT_URL` environment variable matches your frontend URL (e.g., `https://yourapp.vercel.app`).

### MongoDB Connection Errors

**Solution**: Verify `MONGO_URI` is correct and your IP is whitelisted in MongoDB Atlas.

### Password Reset Emails Not Sending

**Solution**: Check SMTP credentials and enable "Less secure app access" for Gmail (if using Gmail).

## License

This project is licensed under the ISC License.

## Author

Umair Ishuman

## Support

For issues, questions, or contributions, please open an issue on [GitHub](https://github.com/Umairishuman/Web-Project/issues).
