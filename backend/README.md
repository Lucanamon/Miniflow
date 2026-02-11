# Miniflow Backend (NestJS)

NestJS API replacing the previous .NET backend. Same surface: PostgreSQL, CORS for Angular, Swagger.

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Health check |
| POST | /api/auth/login | Login (body: `{ "username", "password" }`) |
| GET | /api/users | List users |

Base URL for frontend: `http://localhost:63468/api`

## Setup

1. **Install**

   ```bash
   cd backend
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and adjust if needed. Defaults match the old .NET DB:

   - `PORT=63468`
   - PostgreSQL: `localhost:5432`, database `myappdb`, user `postgres`, password `postgres`

3. **Create the database** (required once)

   PostgreSQL does not create the database for you. From the `backend` folder run:

   ```bash
   npm run db:create
   ```

   This creates `myappdb` if it doesn’t exist. Or create it manually, e.g.  
   `psql -U postgres -c "CREATE DATABASE myappdb;"`

4. **Run**

   ```bash
   npm run start:dev
   ```

   - API: http://localhost:63468/api  
   - Swagger: http://localhost:63468/swagger  

## Database

Uses the same PostgreSQL database as the previous .NET app. Table `Users` (columns `Id`, `Name`) is reused. TypeORM `synchronize: true` in non-production will create missing tables; do not enable in production.
