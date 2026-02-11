# Database Setup Guide

## Problem
The application is failing with authentication errors because the PostgreSQL user `miniflow` and database `miniflowdb` don't exist yet.

## Solution Options

### Option 1: Use Docker (Recommended)
If you have Docker installed, use the provided docker-compose.yml:

```bash
cd backend
docker-compose up -d
```

This will automatically create:
- User: `miniflow`
- Password: `miniflowpass`
- Database: `miniflowdb`

### Option 2: Manual PostgreSQL Setup
If PostgreSQL is already running locally, create the user and database manually:

1. Connect to PostgreSQL as admin:
```bash
psql -U postgres
```

2. Create the user and database:
```sql
CREATE USER miniflow WITH PASSWORD 'miniflowpass' CREATEDB;
CREATE DATABASE miniflowdb OWNER miniflow;
GRANT ALL PRIVILEGES ON DATABASE miniflowdb TO miniflow;
\q
```

### Option 3: Use Existing PostgreSQL Credentials
If you already have a PostgreSQL user, update `.env` file:

```env
DATABASE_URL="postgresql://your_username:your_password@localhost:5432/your_database?schema=public"
```

## After Database Setup

1. Run Prisma migrations:
```bash
npm run prisma:migrate
```

2. (Optional) Seed the database:
```bash
npm run prisma:seed
```

3. Start the application:
```bash
npm run start:dev
```

## Troubleshooting

- **Port 5432 already in use**: PostgreSQL is already running. Use Option 2 or 3 above.
- **Authentication failed**: The user doesn't exist. Create it using Option 2.
- **Database doesn't exist**: Run the create-db script: `npm run db:create`
