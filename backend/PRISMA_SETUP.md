# Prisma ORM Setup Guide

Complete guide for using Prisma ORM with NestJS and PostgreSQL in Docker.

## Quick Start

```bash
# 1. Install Prisma
npm install prisma @prisma/client

# 2. Start PostgreSQL Docker
docker compose up -d

# 3. Generate Prisma Client
npm run prisma:generate

# 4. Run migrations
npm run prisma:migrate

# 5. (Optional) Seed database
npm run prisma:seed

# 6. Start NestJS
npm run start:dev
```

## Prisma Commands

### Generate Prisma Client
```bash
npm run prisma:generate
# Or: npx prisma generate
```
Generates TypeScript types from your schema. Run after schema changes.

### Create Migration
```bash
npm run prisma:migrate
# Or: npx prisma migrate dev --name migration_name
```
Creates and applies a new migration based on schema changes.

### Deploy Migrations (Production)
```bash
npm run prisma:migrate:deploy
# Or: npx prisma migrate deploy
```
Applies pending migrations without creating new ones (for production).

### Reset Database
```bash
npm run prisma:migrate:reset
# Or: npx prisma migrate reset
```
⚠️ **Warning**: Drops database, recreates it, and runs all migrations.

### Prisma Studio (Database GUI)
```bash
npm run prisma:studio
# Or: npx prisma studio
```
Opens visual database browser at http://localhost:5555

### Seed Database
```bash
npm run prisma:seed
# Or: npm run seed
```
Runs seed script to populate sample data.

## Schema File

Location: `prisma/schema.prisma`

Defines:
- Database connection (`datasource db`)
- Models (User, Project, Task)
- Relationships (@relation)
- Indexes (@@index)

## Key Prisma Features Used

### 1. Upsert (Save Progression)
```typescript
await prisma.user.upsert({
  where: { email: 'user@example.com' },
  update: { name: 'Updated Name' },
  create: { email: 'user@example.com', name: 'New Name' },
});
```

### 2. Transactions
```typescript
await prisma.$transaction(async (tx) => {
  const project = await tx.project.create({...});
  const task = await tx.task.create({...});
  return { project, task };
});
```

### 3. Relational Queries (include)
```typescript
const user = await prisma.user.findUnique({
  where: { id },
  include: {
    projects: {
      include: {
        tasks: true,
      },
    },
  },
});
```

### 4. Soft Delete Pattern
```typescript
// Query excluding soft-deleted
where: { deletedAt: null }

// Soft delete
update: { deletedAt: new Date() }
```

### 5. Pagination
```typescript
const [data, total] = await Promise.all([
  prisma.user.findMany({ skip, take: limit }),
  prisma.user.count(),
]);
```

## API Endpoints (Prisma)

### Users
- `POST /api/users-prisma` - Create user
- `GET /api/users-prisma` - List users (pagination: `?page=1&limit=10`)
- `GET /api/users-prisma/:id` - Get user with projects
- `PATCH /api/users-prisma/:id` - Update user
- `POST /api/users-prisma/save` - Upsert user (save progression)
- `DELETE /api/users-prisma/:id` - Soft delete user

### Projects
- `POST /api/projects-prisma` - Create project (with transaction)
- `GET /api/projects-prisma` - List projects with relations (`?ownerId=uuid`)
- `GET /api/projects-prisma/:id` - Get project with nested relations
- `PATCH /api/projects-prisma/:id` - Update project
- `DELETE /api/projects-prisma/:id` - Soft delete project

### Tasks
- `POST /api/tasks-prisma` - Create task
- `GET /api/tasks-prisma` - List tasks (`?projectId=uuid`)
- `GET /api/tasks-prisma/:id` - Get task with project and owner
- `DELETE /api/tasks-prisma/:id` - Soft delete task

## Testing Flow

1. **Start Docker PostgreSQL**
   ```bash
   docker compose up -d
   ```

2. **Run Migrations**
   ```bash
   npm run prisma:migrate
   ```

3. **Seed Data**
   ```bash
   npm run prisma:seed
   ```

4. **Start Backend**
   ```bash
   npm run start:dev
   ```

5. **Test API**
   - Swagger: http://localhost:55598/swagger
   - Or use Postman/curl

6. **Verify Data in Database**
   ```bash
   npm run prisma:studio
   # Opens GUI at http://localhost:5555
   ```

## Example: Create User → Project → Task

```bash
# 1. Create User
POST /api/users-prisma
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
# Response: { "id": "user-uuid", ... }

# 2. Create Project
POST /api/projects-prisma
{
  "name": "My Project",
  "description": "Description",
  "ownerId": "user-uuid"
}
# Response: { "id": "project-uuid", "owner": {...}, ... }

# 3. Create Task
POST /api/tasks-prisma
{
  "title": "Complete feature",
  "projectId": "project-uuid"
}
# Response: { "id": "task-uuid", "project": {...}, ... }
```

## Data Persistence

Docker volume `postgres_data` ensures:
- ✅ Data survives container restarts
- ✅ Data survives `docker compose down`
- ✅ Data survives system reboots

Data is only lost if you explicitly remove the volume:
```bash
docker compose down -v  # Removes volumes
```

## Prisma vs TypeORM

This setup uses **Prisma ORM**. If you need TypeORM, use the original modules:
- `/api/users` (TypeORM)
- `/api/projects` (TypeORM)
- `/api/tasks` (TypeORM)

Prisma endpoints:
- `/api/users-prisma` (Prisma)
- `/api/projects-prisma` (Prisma)
- `/api/tasks-prisma` (Prisma)

Both can coexist - choose based on your needs!
