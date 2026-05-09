# ExamGuard

### Full-Stack Web-Based Quiz & Examination Platform

### National University of Computer and Engineering Sciences — Web Programming Final Project

**Team:**

- Muhammad Umair — 23I-0662
- Mahad Malik — 23I-0537

**Course:** Web Programming | **Submission:** May 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Features at a Glance](#2-features-at-a-glance)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Environment Variables](#5-environment-variables)
6. [Getting Started — Local Setup](#6-getting-started--local-setup)
7. [Authentication & Security](#7-authentication--security)
8. [Role-Based Access Control](#8-role-based-access-control)
9. [Module Details](#9-module-details)
10. [Database Schema](#10-database-schema)
11. [API Reference](#11-api-reference)
12. [Pages & Navigation Structure](#12-pages--navigation-structure)
13. [UI / UX Design System](#13-ui--ux-design-system)
14. [Deployment](#14-deployment)
15. [Implementation Phases](#15-implementation-phases)
16. [Rubric Coverage Map](#16-rubric-coverage-map)
17. [Future Enhancements](#17-future-enhancements)

---

## 1. Project Overview

**ExamGuard** is a full-stack web application that unifies classroom management, quiz delivery, role-based access, and student performance reporting into a single secure platform for academic institutions.

### Problem Statement

Online assessment in universities is fragmented across multiple tools. No single platform combines classroom management, quiz delivery, role-based access, and student performance reporting in one secure, well-designed web application. ExamGuard solves this.

### Core Objectives

- Provide a role-based platform for **Admins**, **Teachers**, and **Students**
- Enable teachers to create, schedule, and manage quizzes and exams
- Enable students to join classes, attempt quizzes, and view results
- Implement secure authentication with encrypted passwords and JWT session management
- Provide dashboards with analytics and performance insights
- Deliver a polished, responsive UI that works on desktop, tablet, and mobile

---

## 2. Features at a Glance

| Module                | Key Features                                                                              |
| --------------------- | ----------------------------------------------------------------------------------------- |
| **Authentication**    | Register, login, logout, password reset via email, remember-me, bcrypt hashing, JWT       |
| **Role-Based Access** | Admin / Teacher / Student — role-guarded routes on both frontend and backend              |
| **Admin Panel**       | User list, activate/deactivate accounts, role changes, platform-wide stats                |
| **Classroom**         | Class creation with join codes, student enrollment, announcements with anonymous feedback |
| **Quiz & Exam**       | MCQ + Subjective questions, scheduling, draft/publish, countdown timer, auto-submit       |
| **Grading & Results** | Auto-grade MCQs, manual teacher grading for subjective, PDF result download               |
| **Analytics**         | Teacher and student dashboards with Recharts charts, participation stats, score trends    |

### Out of Scope (this version)

- Code execution / Judge0 API
- In-browser coding editor (Monaco)
- Webcam proctoring or face detection
- Mobile native application
- Plagiarism detection

---

## 3. Technology Stack

| Layer               | Technology                                                   |
| ------------------- | ------------------------------------------------------------ |
| **Frontend**        | React.js, Tailwind CSS, React Router v6, Axios, Recharts     |
| **Backend**         | Node.js + Express.js (RESTful API)                           |
| **Database**        | MongoDB (Mongoose ODM) — hosted on MongoDB Atlas             |
| **Authentication**  | JWT (`jsonwebtoken`) + `bcrypt` for password hashing         |
| **Email**           | Nodemailer (password reset links)                            |
| **Deployment**      | Vercel (Frontend) + Render (Backend)                         |
| **Version Control** | Git + GitHub (feat:/fix: commit convention, min. 10 commits) |

---

## 4. Project Structure

```
examguard/
├── client/                         # React frontend
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/                 # Icons, images, illustrations
│   │   ├── components/             # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── ProtectedRoute.jsx  # Role-based route guard
│   │   │   ├── Toast.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── QuestionCard.jsx
│   │   │   └── charts/
│   │   │       ├── ScoreBarChart.jsx
│   │   │       └── ProgressLineChart.jsx
│   │   ├── pages/
│   │   │   ├── public/
│   │   │   │   ├── Landing.jsx
│   │   │   │   ├── About.jsx
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   ├── ForgotPassword.jsx
│   │   │   │   └── ResetPassword.jsx
│   │   │   ├── student/
│   │   │   │   ├── StudentDashboard.jsx
│   │   │   │   ├── ClassPage.jsx
│   │   │   │   ├── QuizAttempt.jsx
│   │   │   │   ├── Results.jsx
│   │   │   │   └── Profile.jsx
│   │   │   ├── teacher/
│   │   │   │   ├── TeacherDashboard.jsx
│   │   │   │   ├── ClassManagement.jsx
│   │   │   │   ├── QuizCreate.jsx
│   │   │   │   ├── QuizEdit.jsx
│   │   │   │   └── QuizResults.jsx
│   │   │   └── admin/
│   │   │       ├── AdminDashboard.jsx
│   │   │       └── UserManagement.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx     # Global auth state (user, role, token)
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useToast.js
│   │   ├── services/
│   │   │   └── api.js              # Axios instance with base URL + interceptors
│   │   ├── utils/
│   │   │   └── validators.js       # Client-side validation helpers
│   │   ├── App.jsx                 # Route definitions
│   │   ├── main.jsx
│   │   └── index.css               # Tailwind directives
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express backend
│   ├── config/
│   │   └── db.js                   # MongoDB Atlas connection
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   └── roleMiddleware.js       # Role-based route guard
│   ├── models/
│   │   ├── User.js
│   │   ├── Class.js
│   │   ├── Enrollment.js
│   │   ├── Announcement.js
│   │   ├── Comment.js
│   │   ├── Quiz.js
│   │   ├── Question.js
│   │   ├── Attempt.js
│   │   └── PasswordReset.js
│   ├── routes/
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── admin.js                # /api/admin/*
│   │   ├── classes.js              # /api/classes/*
│   │   ├── quizzes.js              # /api/quizzes/*
│   │   ├── attempts.js             # /api/attempts/*
│   │   └── users.js                # /api/users/*
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── adminController.js
│   │   ├── classController.js
│   │   ├── quizController.js
│   │   └── attemptController.js
│   ├── utils/
│   │   ├── generateToken.js
│   │   ├── sendEmail.js            # Nodemailer wrapper
│   │   └── generateJoinCode.js
│   ├── server.js                   # Express app entry point
│   └── package.json
│
└── README.md
```

---

## 5. Environment Variables

### Server (`server/.env`)

```env
# MongoDB
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/examguard

# JWT
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=60m
JWT_REMEMBER_EXPIRES_IN=7d

# Email (Nodemailer — use Gmail App Password or SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# App
CLIENT_URL=http://localhost:5173
PORT=5000
NODE_ENV=development
```

### Client (`client/.env`)

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

> ⚠️ Never commit `.env` files to GitHub. Both are listed in `.gitignore`.

---

## 6. Getting Started — Local Setup

### Prerequisites

- Node.js v18+
- npm v9+
- A free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A Gmail account (or any SMTP provider) for password reset emails

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/examguard.git
cd examguard
```

### 2. Install Dependencies

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 3. Configure Environment Variables

Copy the example env files and fill in your values:

```bash
# In /server
cp .env.example .env

# In /client
cp .env.example .env
```

### 4. Run the Application

```bash
# Terminal 1 — Backend (runs on http://localhost:5000)
cd server
npm run dev

# Terminal 2 — Frontend (runs on http://localhost:5173)
cd client
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### 5. Seed an Admin Account (Optional)

```bash
cd server
node utils/seedAdmin.js
# Creates: admin@examguard.com / Admin@1234
```

---

## 7. Authentication & Security

### Registration

- Users register with name, email, password, and role (Student or Teacher)
- **Client-side validation:** required fields, email format, password strength (min 8 chars, one uppercase, one number)
- **Server-side validation:** `express-validator` sanitizes and validates all inputs before processing
- Password hashed with **bcrypt** (salt rounds ≥ 10) before storage — plain-text passwords are **never stored or logged**

### Login & Session Management

```
POST /api/auth/login
```

- Credentials verified using `bcrypt.compare()` — never plain string equality
- On success, a **JWT token** is issued and stored in an **HTTP-only Secure cookie**
- Session expires after **60 minutes** of inactivity by default
- **Remember-me** option extends session to **7 days**
- Logout clears the cookie and invalidates the token on the client

### Password Reset Flow

1. User submits email on `/forgot-password`
2. Server generates a **unique, single-use token** stored in the `passwordResets` collection
3. Token expires after **15 minutes**
4. Reset link emailed to user: `{CLIENT_URL}/reset-password/:token`
5. Server validates token on submission — expired or used tokens are rejected
6. New password must meet the same strength requirements as registration

### Security Checklist

- [x] bcrypt salt rounds ≥ 10
- [x] JWT stored in HTTP-only, Secure cookie (not localStorage)
- [x] All API routes validated server-side (prevents XSS and NoSQL injection)
- [x] HTTPS enforced on deployment (Vercel + Render use TLS by default)
- [x] Sensitive routes protected by JWT + role middleware
- [x] Plain-text passwords never appear in logs, responses, or the database

---

## 8. Role-Based Access Control

Three roles are stored in the `users` collection: `admin`, `teacher`, `student`.

### Backend Protection

Every protected route passes through two middleware layers:

```javascript
// authMiddleware.js — verifies JWT and attaches req.user
// roleMiddleware.js — checks req.user.role against required role

router.get("/admin/users", authMiddleware, roleMiddleware("admin"), getUsers);
```

Requests with missing, expired, or invalid tokens receive **401 Unauthorized**. Requests with the wrong role receive **403 Forbidden**.

### Frontend Route Guards

`ProtectedRoute.jsx` wraps role-specific pages. Unauthenticated users are redirected to `/login`. Authenticated users accessing the wrong role's pages are redirected to `/403`.

```jsx
<Route
    path="/admin"
    element={
        <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
        </ProtectedRoute>
    }
/>
```

### Navigation Rendering

The Navbar dynamically renders links based on the logged-in user's role:

| Role                | Visible Nav Links                  |
| ------------------- | ---------------------------------- |
| **Admin**           | Dashboard, User Management         |
| **Teacher**         | Dashboard, My Classes, Create Quiz |
| **Student**         | Dashboard, My Classes, My Results  |
| **Unauthenticated** | Home, About, Login, Register       |

---

## 9. Module Details

### 9.1 Admin Module

- Paginated list of all registered users
- Activate / deactivate user accounts (toggles `isActive` flag)
- Change a user's role (e.g., promote Student → Teacher)
- Platform-wide summary cards: total users, total classes, total quizzes, recent activity

### 9.2 Classroom Module

**Teacher actions:**

- Create a class with name, subject, and description
- System auto-generates a unique **6-character alphanumeric join code**
- View all enrolled students; remove a student from the class
- Post announcements visible to all class members

**Student actions:**

- Join a class by entering the 6-character join code
- View class announcements and comment or reply
- Use **anonymous feedback** option to post without revealing identity

### 9.3 Quiz & Exam Module

**Teacher — Quiz Creation:**

- Multi-step form: title, instructions, time limit, scheduled date/time, availability window
- Two question types:
    - **MCQ** — up to 6 answer options, one marked correct, marks per question
    - **Subjective** — open-ended text, marks assigned, optional model answer for grader reference
- Toggle random question order to reduce pattern recognition
- Save as **Draft** or **Publish** when ready

**Student — Quiz Attempt:**

- See available quizzes per class with open/close times
- Live **countdown timer** displayed throughout the attempt
- Auto-submission when time expires
- Free navigation between questions before submission
- Question-status indicator: answered / unanswered / flagged
- Once submitted, attempt is **locked** — no reattempts

### 9.4 Grading & Results

- **MCQ answers** auto-graded instantly on submission
- **Subjective answers** flagged for manual teacher review
- Teacher marking interface: review responses question by question, enter marks
- Teacher publishes result when all marking is complete
- Students see: total score, per-question breakdown, correct answers (if teacher enables)
- Result report downloadable as **PDF**

### 9.5 Analytics Dashboard

**Teacher Dashboard:**

- Overview cards: total classes, total quizzes, average class score, pending grading tasks
- Score distribution per quiz (Recharts bar chart)
- Student participation rate per quiz
- List of below-average students for follow-up

**Student Dashboard:**

- Overview cards: enrolled classes, quizzes attempted, average score, upcoming deadlines
- Quiz history table: quiz name, date, score, grade
- Score trend over time (Recharts line chart)

---

## 10. Database Schema

### `users`

```
_id, name, email, passwordHash, role (admin|teacher|student),
isActive, createdAt
```

### `classes`

```
_id, name, subject, description, joinCode, teacherId (ref: users), createdAt
```

### `enrollments`

```
_id, classId (ref: classes), studentId (ref: users), joinedAt
```

### `announcements`

```
_id, classId (ref: classes), authorId (ref: users),
content, isAnonymous, createdAt
```

### `comments`

```
_id, announcementId (ref: announcements), authorId (ref: users),
content, isAnonymous, createdAt
```

### `quizzes`

```
_id, classId (ref: classes), title, instructions, timeLimit (minutes),
scheduledAt, closesAt, status (draft|published), createdAt
```

### `questions`

```
_id, quizId (ref: quizzes), type (mcq|subjective), text,
options [ { label, text } ], correctOption, marks
```

### `attempts`

```
_id, quizId (ref: quizzes), studentId (ref: users),
answers [ { questionId, selectedOption, textAnswer, marksAwarded } ],
totalScore, submittedAt, isGraded
```

### `passwordResets`

```
_id, userId (ref: users), token, expiresAt, used (boolean)
```

---

## 11. API Reference

### Auth Routes — `/api/auth`

| Method | Endpoint                 | Access | Description                     |
| ------ | ------------------------ | ------ | ------------------------------- |
| POST   | `/register`              | Public | Register a new user             |
| POST   | `/login`                 | Public | Login and receive JWT cookie    |
| POST   | `/logout`                | Auth   | Clear session cookie            |
| POST   | `/forgot-password`       | Public | Send password reset email       |
| POST   | `/reset-password/:token` | Public | Reset password with valid token |

### Admin Routes — `/api/admin`

| Method | Endpoint            | Access | Description                   |
| ------ | ------------------- | ------ | ----------------------------- |
| GET    | `/users`            | Admin  | Paginated list of all users   |
| PATCH  | `/users/:id/status` | Admin  | Activate or deactivate a user |
| PATCH  | `/users/:id/role`   | Admin  | Change a user's role          |
| GET    | `/stats`            | Admin  | Platform-wide summary stats   |

### Class Routes — `/api/classes`

| Method | Endpoint                             | Access  | Description                      |
| ------ | ------------------------------------ | ------- | -------------------------------- |
| POST   | `/`                                  | Teacher | Create a new class               |
| GET    | `/`                                  | Teacher | Get all classes owned by teacher |
| GET    | `/:id`                               | Auth    | Get class details                |
| POST   | `/join`                              | Student | Join a class by join code        |
| GET    | `/:id/students`                      | Teacher | List enrolled students           |
| DELETE | `/:id/students/:studentId`           | Teacher | Remove a student                 |
| POST   | `/:id/announcements`                 | Teacher | Post an announcement             |
| POST   | `/:id/announcements/:annId/comments` | Auth    | Comment on announcement          |

### Quiz Routes — `/api/quizzes`

| Method | Endpoint          | Access  | Description                     |
| ------ | ----------------- | ------- | ------------------------------- |
| POST   | `/`               | Teacher | Create a quiz                   |
| GET    | `/:id`            | Auth    | Get quiz details                |
| PUT    | `/:id`            | Teacher | Update a draft quiz             |
| PATCH  | `/:id/publish`    | Teacher | Publish a quiz                  |
| GET    | `/class/:classId` | Auth    | List quizzes for a class        |
| GET    | `/:id/results`    | Teacher | All student attempts for a quiz |

### Attempt Routes — `/api/attempts`

| Method | Endpoint      | Access  | Description                    |
| ------ | ------------- | ------- | ------------------------------ |
| POST   | `/`           | Student | Start a quiz attempt           |
| PUT    | `/:id/submit` | Student | Submit a completed attempt     |
| GET    | `/:id`        | Auth    | Get attempt details and result |
| PATCH  | `/:id/grade`  | Teacher | Grade subjective answers       |

---

## 12. Pages & Navigation Structure

### Public Pages (Unauthenticated)

| Route                    | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| `/`                      | Landing page: product overview, features section, call-to-action buttons |
| `/about`                 | About the platform, team, and university                                 |
| `/login`                 | Login form with email, password, remember-me, and forgot-password link   |
| `/register`              | Registration form with role selection, all fields validated              |
| `/forgot-password`       | Email entry to receive password reset link                               |
| `/reset-password/:token` | New password form — token validated server-side                          |

### Student Pages (Authenticated — Student role)

| Route                 | Description                                                 |
| --------------------- | ----------------------------------------------------------- |
| `/dashboard`          | Overview: enrolled classes, upcoming quizzes, score summary |
| `/class/:id`          | Class page: announcements, quiz list, member list           |
| `/quiz/:id`           | Quiz attempt interface with timer and question navigation   |
| `/results/:attemptId` | Result view for a completed attempt                         |
| `/profile`            | Edit name, profile photo, and change password               |

### Teacher Pages (Authenticated — Teacher role)

| Route               | Description                                                   |
| ------------------- | ------------------------------------------------------------- |
| `/dashboard`        | Overview: class stats, quiz stats, pending marking tasks      |
| `/class/:id`        | Class management: students, announcements, quizzes, analytics |
| `/quiz/create`      | Multi-step form to build a new quiz                           |
| `/quiz/:id/edit`    | Edit an existing draft quiz                                   |
| `/quiz/:id/results` | View all student attempts; grade subjective answers           |

### Admin Pages (Authenticated — Admin role)

| Route          | Description                                                      |
| -------------- | ---------------------------------------------------------------- |
| `/admin`       | Admin dashboard with platform-wide summary                       |
| `/admin/users` | Full user list with activate/deactivate and role-change controls |

### Global / Shared

| Page          | Description                                                                   |
| ------------- | ----------------------------------------------------------------------------- |
| Sticky Navbar | Present on every page; links change based on user role                        |
| 404 Page      | Shown for any unmatched route                                                 |
| 403 Page      | Shown when a user accesses a route outside their role                         |
| Footer        | Present on every page: contact info, social links, copyright © 2026 ExamGuard |

---

## 13. UI / UX Design System

### Color Palette

| Token     | Hex                   | Usage                               |
| --------- | --------------------- | ----------------------------------- |
| Primary   | `#0D9488` (Teal-600)  | Buttons, active states, highlights  |
| Dark Navy | `#0F172A` (Slate-900) | Navbar, sidebar, headings           |
| Surface   | `#F8FAFC` (Slate-50)  | Page backgrounds                    |
| Card      | `#FFFFFF`             | Card backgrounds                    |
| Error     | `#EF4444` (Red-500)   | Validation errors, incorrect answer |
| Success   | `#22C55E` (Green-500) | Correct answer, success toast       |

### Typography

- Headings: `font-bold`, scale from `text-4xl` (hero) down to `text-lg` (section headings)
- Body: `text-base`, `text-slate-600`
- Code / labels: `font-mono`

### Responsive Breakpoints

| Breakpoint | Width  | Layout Behavior                       |
| ---------- | ------ | ------------------------------------- |
| Mobile     | 375px  | Single-column, hamburger nav          |
| Tablet     | 768px  | Two-column grids, collapsed sidebar   |
| Desktop    | 1280px | Full sidebar, multi-column dashboards |

### Micro-interactions

- Button hover states with Tailwind `transition` and `hover:` variants
- Loading spinners on all async operations
- Page transition fades using React Router + CSS transitions
- Toast notifications (success / error / info) via `useToast` hook
- Question-status indicators on quiz attempt page (answered / unanswered / flagged)

### Icons & Illustrations

- Icons: **Heroicons** or **Lucide React**
- Custom SVG illustrations on the Landing page hero section
- Lazy-loaded images throughout

---

## 14. Deployment

### Frontend — Vercel

1. Push `client/` to GitHub
2. Import project on [vercel.com](https://vercel.com)
3. Set **Root Directory** to `client`
4. Add environment variable: `VITE_API_BASE_URL=https://your-render-backend.onrender.com/api`
5. Deploy — Vercel auto-deploys on every push to `main`

### Backend — Render

1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo; set **Root Directory** to `server`
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add all environment variables from `server/.env` in the Render dashboard
6. Deploy

### Git Conventions

Commit messages must follow the **Conventional Commits** format:

```
feat: add quiz timer auto-submit
fix: correct bcrypt comparison in login controller
docs: update README with deployment steps
chore: configure Tailwind purge settings
refactor: extract token generation to utility function
```

Minimum **10 meaningful commits** reflecting incremental development — not a single bulk commit.

---

## 15. Implementation Phases

| Phase                                      | Timeline | Tasks                                                                                                                                                                                                |
| ------------------------------------------ | -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Phase 1 — Setup & Auth**                 | Week 1   | Initialize React + Express repos on GitHub. Configure MongoDB Atlas. Implement register, login, logout, JWT middleware, bcrypt. Build password reset email flow. Deploy skeleton to Vercel + Render. |
| **Phase 2 — RBAC & Admin**                 | Week 2   | Role-based route guards (backend + frontend). Admin dashboard: user list, activate/deactivate, role-change. Role-specific navigation and 403/404 pages.                                              |
| **Phase 3 — Classroom Module**             | Week 2–3 | Class creation with join code generation. Student join-class flow, class listing, member management. Announcements with comments and anonymous feedback.                                             |
| **Phase 4 — Quiz & Exam Module**           | Week 3–4 | Multi-step quiz creation (MCQ + Subjective). Quiz scheduling, draft/publish, availability window. Student quiz attempt interface with countdown timer. Auto-submission on expiry; lock after submit. |
| **Phase 5 — Grading & Results**            | Week 4   | Auto-grading MCQs on submission. Teacher marking interface for subjective answers. Student result page with score breakdown and PDF export.                                                          |
| **Phase 6 — Dashboards & Analytics**       | Week 5   | Teacher dashboard: Recharts charts, participation stats, pending marking queue. Student dashboard: quiz history, progress chart, upcoming deadlines.                                                 |
| **Phase 7 — Polish, Testing & Deployment** | Week 5–6 | Responsive design testing at all breakpoints. Image compression, PurgeCSS, API pagination. End-to-end bug fixing. README and live demo preparation.                                                  |

---

## 16. Rubric Coverage Map

| #   | Criterion                   | Implementation                                                                                                 |
| --- | --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | Core features functional    | Register/login forms, quiz creation, quiz attempt, grading controls — all interactive, no errors               |
| 2   | Login & Signup              | Full end-to-end auth flow with JWT session management                                                          |
| 3   | Data processing             | MongoDB CRUD via RESTful Express API for all collections                                                       |
| 4   | bcrypt hashing              | Passwords hashed with salt rounds ≥ 10 before storage                                                          |
| 5   | No plain-text passwords     | Plain-text passwords never stored, logged, or returned in API responses                                        |
| 6   | bcrypt.compare()            | Login uses `bcrypt.compare()` — never string equality                                                          |
| 7   | Password reset              | Token-based, 15-min expiry, single-use, email link                                                             |
| 8   | Three roles                 | `admin`, `teacher`, `student` stored in `users` collection                                                     |
| 9   | Admin route protection      | Non-admin users redirected to 403 page; backend middleware enforces                                            |
| 10  | Admin user management       | View users, activate/deactivate, role-change — all functional                                                  |
| 11  | Dynamic nav rendering       | Navbar links conditionally rendered based on `AuthContext` role                                                |
| 12  | Backend route guards        | `authMiddleware` + `roleMiddleware` on all protected Express routes                                            |
| 13  | Client-side validation      | Required fields, email format, password strength enforced in React before `axios` call                         |
| 14  | Server-side validation      | `express-validator` on all API routes                                                                          |
| 15  | Inline error messages       | Errors displayed below each invalid field, not as an alert                                                     |
| 16  | React Router navbar         | All routes verified — no broken links                                                                          |
| 17  | Logical page hierarchy      | Landing → Auth → Dashboard → Class → Quiz → Results                                                            |
| 18  | Sticky navbar + breadcrumbs | Sticky nav with dropdown menus and breadcrumbs on inner pages                                                  |
| 19  | Consistent Tailwind design  | Unified teal/dark navy palette, font scale, and spacing throughout                                             |
| 20  | Responsive layout           | Tested at 1280px (desktop), 768px (tablet), 375px (mobile)                                                     |
| 21  | JWT + HTTP-only cookie      | Login/logout with JWT in HTTP-only cookie; remember-me extends to 7 days                                       |
| 22  | Session expiry              | 60-minute inactivity expiry; re-login required for sensitive actions                                           |
| 23  | GitHub repo structure       | `client/`, `server/`, `README.md` at root                                                                      |
| 24  | ≥ 10 meaningful commits     | Incremental commits reflecting each development phase                                                          |
| 25  | Commit message convention   | `feat:`, `fix:`, `docs:`, `chore:` prefix on all commits                                                       |
| 26  | Footer on every page        | Contact email, GitHub/social links, © 2026 ExamGuard                                                           |
| 27  | Original content            | All page content written specifically for ExamGuard — no lorem ipsum                                           |
| 28  | Icons & illustrations       | Heroicons / Lucide icons, custom SVG illustrations on landing page                                             |
| 29  | Unique concept              | Class-based quiz platform with role hierarchy and analytics — beyond generic CRUD                              |
| 30  | Polished palette            | Teal + dark navy, clean typography, generous whitespace                                                        |
| 31  | Micro-interactions          | Hover states, loading spinners, page transition fades, toast notifications                                     |
| 32  | Creative landing page       | Hero section with illustrations, feature grid, testimonials, clear CTA                                         |
| 33  | Performance optimization    | Images compressed and lazy-loaded; unused Tailwind classes purged; minimal third-party scripts; API pagination |
| 34  | README documentation        | This file — project description, features, setup, env variables guide                                          |
| 35  | Live demo / walkthrough     | Deployed on Vercel + Render, or recorded walkthrough video provided                                            |

---

## 17. Future Enhancements

- **Code execution** — In-browser editor with Judge0 API for lab/coding tasks
- **AI proctoring** — Tab-switch detection, fullscreen enforcement, activity logs
- **Plagiarism detection** — For submitted subjective answers
- **Mobile native app** — React Native version
- **Real-time notifications** — WebSocket-based live alerts for new quizzes and grades
- **Live video proctoring** — Webcam integration for high-stakes exams

---

_NUCES — Web Programming Final Project | Spring 2026 | © 2026 ExamGuard_
