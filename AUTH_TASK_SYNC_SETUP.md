# Auth + Task Sync System

## Overview

- **Backend**: NestJS + Prisma + JWT
- **Frontend**: Angular + AuthService + HTTP Interceptor + Today sync

## Backend Setup

1. **Install dependencies** (already done):
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment** – ensure `.env` has:
   ```
   JWT_SECRET=your-secret-key-change-in-production
   DATABASE_URL=postgresql://...
   ```

3. **Run Prisma migration**:
   ```bash
   cd backend
   npx prisma migrate dev --name add_user_tasks
   ```

4. **Start backend**:
   ```bash
   npm run start:dev
   ```

## Backend Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | /api/auth/register | Public | Register new user |
| POST | /api/auth/login | Public | Login (returns JWT) |
| GET | /api/tasks | JWT | Get user tasks |
| POST | /api/tasks | JWT | Create task |
| PATCH | /api/tasks/:id | JWT | Update task |
| DELETE | /api/tasks/:id | JWT | Delete task |

## Frontend Setup

1. Set `apiUrl` in `projects/frontend/src/environments/environment.ts` to your backend URL (e.g. `https://api.mybackend.com/api`).

2. **Login/Register**: Go to **Settings** and use the auth forms.

3. **Sync behavior**:
   - **Logged in**: Today loads tasks from the server; toggle/delete sync to the API.
   - **Logged out**: Tasks are stored in localStorage only.

## Flow

1. User registers or logs in via Settings.
2. JWT is stored in localStorage via AuthService.
3. HTTP interceptor adds `Authorization: Bearer <token>` to requests.
4. Today component loads from `/api/tasks` when logged in.
5. Toggle and delete actions are sent to the API when authenticated.
6. Sky add task: when logged in, creates task via API and stores it locally.
