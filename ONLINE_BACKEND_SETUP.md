# Online Backend Connection Setup - Quick Reference

## ✅ What Was Configured

### 1. Frontend Environment Files

**`environment.ts` (Development):**
```typescript
apiUrl: 'https://api.mybackend.com/api' // Replace with your backend URL
```

**`environment.prod.ts` (Production):**
```typescript
apiUrl: 'https://api.mybackend.com/api' // Replace with your backend URL
```

### 2. Backend CORS Configuration

**`backend/src/main.ts`:**
- ✅ Supports multiple origins (localhost + production domains)
- ✅ Credentials enabled
- ✅ Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
- ✅ Allowed headers: Content-Type, Authorization

### 3. Enhanced API Service

**New Methods Added:**
- `createUser(userData)` - POST /users-prisma
- `saveProgress(progressData)` - POST /users-prisma/save
- `getUsersPaginated(page, limit)` - GET /users-prisma?page=1&limit=10
- `getUserById(id)` - GET /users-prisma/:id

### 4. Prisma Already Configured

- ✅ Uses `DATABASE_URL` from environment
- ✅ Upsert logic in `saveProgression()`
- ✅ Pagination support
- ✅ Soft delete support

---

## 🚀 Quick Start

### Step 1: Update Backend URL

**Frontend `environment.ts` and `environment.prod.ts`:**
```typescript
apiUrl: 'https://your-backend-domain.com/api'
```

### Step 2: Update CORS Origins

**Backend `src/main.ts`:**
```typescript
const allowedOrigins = [
  'http://localhost:4200',
  'https://your-frontend-domain.com', // Add your production frontend
];
```

### Step 3: Set Environment Variables (Backend)

**On your hosting platform, set:**
```env
DATABASE_URL=postgresql://user:pass@host:5432/dbname
NODE_ENV=production
PORT=3000
JWT_SECRET=your-secret-key
```

### Step 4: Deploy

**Backend:**
```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy
npm run build
npm run start:prod
```

**Frontend:**
```bash
npm run build:frontend:prod
# Deploy dist/frontend/ folder
```

---

## 📝 Example Usage

### Frontend: Create User

```typescript
import { ApiService } from './core/services/api.service';

constructor(private api: ApiService) {}

createUser() {
  this.api.createUser({
    email: 'user@example.com',
    password: 'SecurePass123!',
    name: 'John Doe'
  }).subscribe({
    next: (user) => console.log('User created:', user),
    error: (err) => console.error('Error:', err)
  });
}
```

### Frontend: Save Progress

```typescript
saveProgress() {
  this.api.saveProgress({
    email: 'user@example.com',
    name: 'Updated Name'
  }).subscribe({
    next: (user) => console.log('Progress saved:', user),
    error: (err) => console.error('Error:', err)
  });
}
```

---

## 🔍 Testing Checklist

- [ ] Backend health endpoint works: `https://api.mybackend.com/api/health`
- [ ] Swagger docs accessible: `https://api.mybackend.com/swagger`
- [ ] Frontend can call backend API
- [ ] No CORS errors in browser console
- [ ] Data saves to database correctly
- [ ] Environment variables loaded correctly

---

## 📚 Additional Resources

- **JWT Auth Example:** `backend/src/auth/examples/jwt-auth.example.ts`
- **Prisma Transactions:** `backend/src/users/examples/prisma-transaction.example.ts`
- **Full Deployment Guide:** `DEPLOYMENT_GUIDE.md`

---

## ⚠️ Important Notes

1. **Never expose DATABASE_URL** in frontend code
2. **Always use HTTPS** in production
3. **Update CORS origins** before deploying
4. **Test CORS** from production frontend domain
5. **Use environment variables** for all secrets
