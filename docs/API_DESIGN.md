# Miniflow API Design

API surface designed to match the Angular frontend (`ApiService`). Base path: `/api`.

## Overview

| Area    | Endpoints | Auth |
|---------|-----------|------|
| Health  | GET /health | No |
| Auth    | POST /auth/register, POST /auth/login | No |
| Users   | GET /users | No |
| Tasks   | GET /tasks, POST /tasks, PATCH /tasks/:id, DELETE /tasks/:id | Bearer (JWT) |

## 1. Health

- **GET** `/api/health`  
  - Response: `{ "status": "ok", "timestamp": "ISO8601" }`

## 2. Auth

- **POST** `/api/auth/register`  
  - Body: `{ "email": string, "password": string, "name"?: string }`  
  - Response: `{ "access_token": string, "expiresIn"?: number, "user"?: { "id", "email", "name" } }`

- **POST** `/api/auth/login`  
  - Body: `{ "email": string, "password": string }`  
  - Response: same as register

## 3. Users

- **GET** `/api/users`  
  - Response: `User[]`  
  - User: `{ "id", "email", "name"?, "createdAt"?, "updatedAt"? }`

## 4. Tasks (JWT optional for now)

- **GET** `/api/tasks`  
  - Headers: `Authorization: Bearer <token>` (optional for now)  
  - Response: `ApiTask[]`  
  - ApiTask: `{ "id", "title", "board"?, "dueTime"?, "completed", "userId", "createdAt"? }`

- **POST** `/api/tasks`  
  - Body: `{ "title", "board"?, "dueTime"?, "completed"?: boolean }`  
  - Response: `ApiTask`

- **PATCH** `/api/tasks/:id`  
  - Body: `{ "title"?, "board"?, "dueTime"?, "completed"? }`  
  - Response: `ApiTask`

- **DELETE** `/api/tasks/:id`  
  - Response: `{ "message": string }`

## Error responses

Use standard HTTP status codes. Body can be: `{ "message": string, "error"?: object }`.

## Frontend mapping

- `api.service.ts` uses `environment.apiUrl` (e.g. `/api`) and appends paths above.
- Auth endpoints return `access_token` for use in `Authorization: Bearer <token>` on task endpoints.
