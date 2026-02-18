# Deployment Guide: Angular Frontend + NestJS Backend (Online)

## 🎯 Overview

This guide helps you deploy your Angular frontend and NestJS backend to production, ensuring they communicate correctly via HTTPS.

---

## 📋 Pre-Deployment Checklist

### Backend (NestJS + Prisma)

- [ ] **Environment Variables Set**
  - `DATABASE_URL` - PostgreSQL connection string
  - `PORT` - Server port (usually auto-set by hosting)
  - `NODE_ENV=production`
  - `JWT_SECRET` - Secret key for JWT tokens (if using auth)
  - `BASE_URL` - Your backend URL (optional, for logging)

- [ ] **CORS Configured**
  - Frontend production domain added to `allowedOrigins` in `main.ts`
  - Credentials enabled if needed

- [ ] **Prisma Migrations Run**
  - `npx prisma migrate deploy` (production migrations)
  - `npx prisma generate` (generate Prisma Client)

- [ ] **Database Connection**
  - PostgreSQL accessible from hosting server
  - Connection string tested

- [ ] **Build Scripts**
  - `npm run build` creates `dist/` folder
  - `npm run start:prod` runs production server

### Frontend (Angular)

- [ ] **Environment Files Updated**
  - `environment.prod.ts` has correct backend URL
  - `environment.ts` has correct backend URL (or proxy for local dev)

- [ ] **Build Configuration**
  - `angular.json` has production build config
  - File replacements configured (`environment.ts` → `environment.prod.ts`)

- [ ] **API Service**
  - Uses `environment.apiUrl` (not hardcoded URLs)
  - Error handling implemented

---

## 🚀 Backend Deployment Steps

### Step 1: Prepare Environment Variables

Create `.env` file on your server (or use hosting platform's env vars):

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/dbname?schema=public
JWT_SECRET=your-super-secret-jwt-key-change-this
BASE_URL=https://api.mybackend.com
```

### Step 2: Update CORS in `main.ts`

```typescript
const allowedOrigins = [
  'http://localhost:4200', // Keep for local testing
  'https://myfrontenddomain.com', // Your production frontend
  'https://myapp.vercel.app', // If using Vercel
];
```

### Step 3: Run Prisma Migrations

```bash
cd backend
npm install
npx prisma generate
npx prisma migrate deploy  # Production-safe migrations
```

### Step 4: Build and Start

```bash
npm run build
npm run start:prod
```

### Step 5: Verify Backend

- Check health endpoint: `https://api.mybackend.com/api/health`
- Check Swagger: `https://api.mybackend.com/swagger`
- Test CORS: Open browser console on frontend, call API

---

## 🌐 Frontend Deployment Steps

### Step 1: Update `environment.prod.ts`

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://api.mybackend.com/api', // Your actual backend URL
};
```

### Step 2: Build for Production

```bash
cd projects/frontend  # or root if using Angular CLI from root
ng build --configuration production
# OR
npm run build:frontend:prod
```

### Step 3: Deploy `dist/frontend/` Folder

Upload to:
- **Vercel**: Connect repo, auto-deploys
- **Netlify**: Drag & drop `dist/frontend/` folder
- **GitHub Pages**: Push to `gh-pages` branch
- **Firebase Hosting**: `firebase deploy`

### Step 4: Verify Frontend

- Open deployed frontend URL
- Open browser DevTools → Network tab
- Check API calls go to correct backend URL
- Verify no CORS errors

---

## 🔒 Security Checklist

### Backend

- [ ] **Never expose DATABASE_URL** in frontend code
- [ ] **Use environment variables** for secrets
- [ ] **Enable HTTPS only** (most hosting does this automatically)
- [ ] **Validate all DTOs** with class-validator
- [ ] **Hash passwords** using bcrypt
- [ ] **Exclude sensitive fields** from API responses (password, etc.)
- [ ] **Use JWT tokens** for authentication (if needed)
- [ ] **Set secure CORS origins** (not `*`)

### Frontend

- [ ] **Never hardcode API keys** or secrets
- [ ] **Use HTTPS** for all API calls in production
- [ ] **Handle errors gracefully** (don't expose backend details)
- [ ] **Validate user input** before sending to API
- [ ] **Store tokens securely** (use httpOnly cookies or secure storage)

---

## 🧪 Testing Online Connection

### 1. Test Backend Directly

```bash
# Health check
curl https://api.mybackend.com/api/health

# Get users (if no auth required)
curl https://api.mybackend.com/api/users-prisma
```

### 2. Test from Frontend

```typescript
// In Angular component
constructor(private api: ApiService) {}

ngOnInit() {
  this.api.getHealth().subscribe({
    next: (data) => console.log('Backend connected:', data),
    error: (err) => console.error('Backend error:', err),
  });
}
```

### 3. Check Browser Console

- Open DevTools → Network tab
- Look for API requests
- Verify:
  - ✅ Status 200 (success)
  - ✅ Correct URL (your backend domain)
  - ✅ No CORS errors
  - ✅ Response data received

---

## 🐛 Common Issues & Solutions

### Issue: CORS Error

**Error:** `Access to fetch at 'https://api...' from origin 'https://frontend...' has been blocked by CORS policy`

**Solution:**
1. Add frontend domain to `allowedOrigins` in backend `main.ts`
2. Restart backend server
3. Clear browser cache

### Issue: 404 Not Found

**Error:** `GET https://api.mybackend.com/api/users 404`

**Solution:**
1. Check backend is running: `https://api.mybackend.com/api/health`
2. Verify global prefix: `app.setGlobalPrefix('api')` in `main.ts`
3. Check route exists: `@Controller('users-prisma')` matches URL

### Issue: Database Connection Failed

**Error:** `PrismaClientInitializationError: Can't reach database server`

**Solution:**
1. Verify `DATABASE_URL` is correct
2. Check database allows connections from hosting IP
3. Test connection: `psql $DATABASE_URL`
4. Ensure database exists

### Issue: Environment Variables Not Loading

**Error:** `Environment variable not found: DATABASE_URL`

**Solution:**
1. Check `.env` file exists in backend root
2. Verify hosting platform has env vars set
3. Restart server after adding env vars

---

## 📝 Example Hosting Platforms

### Backend Hosting

**Render.com:**
```bash
# Build Command
npm install && npx prisma generate && npm run build

# Start Command
npm run start:prod

# Environment Variables (set in dashboard)
DATABASE_URL=postgresql://...
NODE_ENV=production
```

**Fly.io:**
```bash
flyctl launch
flyctl secrets set DATABASE_URL=postgresql://...
flyctl deploy
```

**Railway:**
- Connect GitHub repo
- Set environment variables in dashboard
- Auto-deploys on push

### Frontend Hosting

**Vercel:**
- Connect GitHub repo
- Framework preset: Angular
- Build command: `npm run build:frontend:prod`
- Output directory: `dist/frontend`

**Netlify:**
- Drag & drop `dist/frontend` folder
- Or connect GitHub for auto-deploy

---

## ✅ Final Verification

1. **Backend Health:** `https://api.mybackend.com/api/health` → Returns `{ status: "ok" }`
2. **Swagger Docs:** `https://api.mybackend.com/swagger` → Opens API docs
3. **Frontend Loads:** `https://myfrontend.com` → No console errors
4. **API Calls Work:** Frontend can fetch data from backend
5. **CORS Works:** No CORS errors in browser console
6. **Database Saves:** Create user → Check database → Data exists

---

## 🎉 Success!

Your Angular frontend and NestJS backend are now connected online! 🚀
