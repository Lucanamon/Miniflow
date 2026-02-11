# Miniflow Backend (NestJS)

NestJS API with PostgreSQL relational database. Docker setup for production-style development.

## Quick Start

```bash
# 1. Start PostgreSQL Docker container
docker compose up -d

# 2. Install dependencies
npm install

# 3. Copy environment file
cp .env.example .env

# 4. Run migrations
npm run migration:run

# 5. (Optional) Seed sample data
npm run seed

# 6. Start backend
npm run start:dev
```

- API: http://localhost:55598/api  
- Swagger: http://localhost:55598/swagger  

## Docker Setup

### Start PostgreSQL

```bash
docker compose up -d
```

This starts PostgreSQL 15 in a Docker container with:
- Container name: `miniflow-postgres`
- Database: `miniflowdb`
- User: `miniflow` / Password: `miniflowpass`
- Port: `5432`
- **Persistent volume**: `postgres_data` (data survives container restarts)

### Stop PostgreSQL

```bash
docker compose down
```

### View Logs

```bash
docker compose logs -f postgres
```

### Data Persistence

Data is stored in Docker volume `postgres_data`. Even if you stop/remove the container, data persists. To completely remove data:

```bash
docker compose down -v  # Removes volumes too
```

## Database Schema

### Relational Structure

```
User (1) ──< (Many) Project (1) ──< (Many) Task
```

- **User**: Has many Projects
- **Project**: Belongs to User, has many Tasks
- **Task**: Belongs to Project

### Tables

- `users` - User accounts (id UUID, email, password, name, timestamps)
- `projects` - Projects owned by users (id UUID, name, description, ownerId FK)
- `tasks` - Tasks within projects (id UUID, title, description, completed, projectId FK)

All tables include:
- `id` (UUID primary key)
- `createdAt`, `updatedAt` (timestamps)
- `deletedAt` (soft delete support)

## Migrations

### Generate Migration

```bash
npm run migration:generate -- -n MigrationName
```

### Run Migrations

```bash
npm run migration:run
```

### Revert Last Migration

```bash
npm run migration:revert
```

### Show Migration Status

```bash
npm run migration:show
```

## API Endpoints

### Users

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/users | List users (supports `?page=1&limit=10`) |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create new user |
| PATCH | /api/users/:id | Update user |
| POST | /api/users/save | Save progression (update or create) |
| DELETE | /api/users/:id | Soft delete user |

### Projects

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/projects | List projects (supports `?ownerId=uuid`) |
| GET | /api/projects/:id | Get project by ID (with owner & tasks) |
| POST | /api/projects | Create project (requires `ownerId`) |
| PATCH | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Soft delete project |

### Tasks

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/tasks | List tasks (supports `?projectId=uuid`) |
| GET | /api/tasks/:id | Get task by ID (with project & owner) |
| POST | /api/tasks | Create task (requires `projectId`) |
| DELETE | /api/tasks/:id | Soft delete task |

## Example API Calls

### Create User → Project → Task Chain

```bash
# 1. Create User
POST /api/users
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "name": "John Doe"
}
# Response: { "id": "user-uuid", ... }

# 2. Create Project (linked to User)
POST /api/projects
{
  "name": "My Project",
  "description": "Project description",
  "ownerId": "user-uuid-from-step-1"
}
# Response: { "id": "project-uuid", "owner": {...}, ... }

# 3. Create Task (linked to Project)
POST /api/tasks
{
  "title": "Complete feature",
  "description": "Task description",
  "projectId": "project-uuid-from-step-2"
}
# Response: { "id": "task-uuid", "project": {...}, ... }
```

### Get Project with Relationships

```bash
GET /api/projects/project-uuid
# Returns project with owner and all tasks loaded
```

## Environment Variables

Copy `.env.example` to `.env`:

```env
PORT=55598
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=miniflow
DB_PASSWORD=miniflowpass
DB_DATABASE=miniflowdb
```

## Architecture

### Entity Layer
- `BaseEntity` - Common fields (UUID id, timestamps, soft delete)
- `User` - User accounts with OneToMany Projects
- `Project` - Projects with ManyToOne User, OneToMany Tasks
- `Task` - Tasks with ManyToOne Project

### DTO Layer
- Validation with `class-validator`
- Type-safe request/response handling

### Service Layer
- Business logic
- Relationship validation (e.g., ensures owner exists before creating project)
- Password hashing (bcrypt)
- Transactions support

### Controller Layer
- REST endpoints
- Swagger documentation
- Password exclusion from responses

## Save Flow Example

**ProjectsService.create()** demonstrates proper relationship handling:

```typescript
async create(createProjectDto: CreateProjectDto): Promise<Project> {
  // 1. Validate owner exists
  const owner = await this.userRepository.findOne({
    where: { id: createProjectDto.ownerId }
  });
  if (!owner) throw new NotFoundException('User not found');

  // 2. Create project with relationship
  const project = this.projectRepository.create({
    ...createProjectDto,
    owner, // Attach relationship
  });

  // 3. Save (TypeORM handles FK automatically)
  return this.projectRepository.save(project);
}
```

## Security

- Passwords hashed with bcrypt (10 rounds)
- Passwords never returned in API responses
- Email uniqueness enforced
- Soft delete support (CASCADE deletes for relationships)
- Foreign key constraints ensure data integrity

## Production Notes

- `synchronize: false` - Always use migrations
- Migrations run automatically if `migrationsRun: true` (currently false)
- Docker volumes persist data across restarts
- Foreign keys with CASCADE ensure referential integrity

## Seed Data

Populate database with sample data:

```bash
npm run seed
```

Creates:
- 1 demo user (email: `demo@example.com`, password: `password123`)
- 1 project owned by demo user
- 3 sample tasks in the project
