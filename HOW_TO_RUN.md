# How to Run Miniflow

## Quick Start - Run Both Together! 🚀

### Easiest Way (Recommended)

Run both frontend and backend together in one command:

```bash
npm run dev
```

Or with backend hot reload:

```bash
npm run dev:watch
```

This starts both:
- **Backend:** `http://localhost:5000` (API + Swagger UI)
- **Frontend:** `http://localhost:4200`

---

## Run Separately (Alternative)

If you prefer to run them in separate terminals:

### 1. Start the Backend (ASP.NET)

Open a terminal and run:

```bash
npm run start:backend
```

Or with hot reload (auto-restart on changes):

```bash
npm run watch:backend
```

**Backend will run on:** `http://localhost:5000`
- API: `http://localhost:5000/api`
- Swagger UI: `http://localhost:5000/swagger`

### 2. Start the Frontend (Angular)

Open a **second terminal** and run:

```bash
npm run start:frontend
```

**Frontend will run on:** `http://localhost:4200`

## Connection Setup

✅ **They are connected!** Here's how:

### Backend Configuration
- **Port:** `5000`
- **API Route Prefix:** `/api` (all controllers use `api/[controller]`)
- **CORS:** Configured to allow requests from `http://localhost:4200`

### Frontend Configuration
- **Port:** `4200`
- **API Proxy:** Configured in `proxy.conf.json` to proxy `/api` → `http://localhost:5000`
- **Environment:** Uses `/api` as the base URL (proxied automatically)

### How It Works

1. Frontend makes requests to `/api/...` (e.g., `/api/WeatherForecast`)
2. Angular dev server proxies these requests to `http://localhost:5000/api/...`
3. Backend receives the request and processes it
4. CORS allows the response to be sent back to the frontend

## Testing the Connection

### Option 1: Use Swagger UI
1. Start the backend
2. Open `http://localhost:5000/swagger`
3. Try the `GET /api/WeatherForecast` endpoint

### Option 2: Test from Frontend
1. Start both backend and frontend
2. Open browser console at `http://localhost:4200`
3. Run:
```javascript
fetch('/api/WeatherForecast')
  .then(r => r.json())
  .then(console.log);
```

### Option 3: Use curl
```bash
curl http://localhost:5000/api/WeatherForecast
```

## Available Endpoints

- `GET /api/WeatherForecast` - Test endpoint (returns weather forecast data)

## Troubleshooting

### Backend won't start
- Make sure .NET 8.0 SDK is installed: `dotnet --version`
- Restore NuGet packages: `cd backend && dotnet restore`

### Frontend can't connect to backend
- Make sure backend is running on port 5000
- Check browser console for CORS errors
- Verify `proxy.conf.json` is configured correctly

### CORS Errors
- Backend CORS is configured for `http://localhost:4200`
- Make sure frontend is running on port 4200
- Restart backend after changing CORS settings

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Run both frontend and backend together |
| `npm run dev:watch` | Run both with backend hot reload |
| `npm run start:frontend` | Run frontend only |
| `npm run start:backend` | Run backend only |
| `npm run watch:backend` | Run backend with hot reload |

## Development Tips

- **Use `npm run dev`** - Easiest way to start everything!
- **Use `npm run dev:watch`** - For backend hot reload + frontend
- Frontend has built-in hot reload (HMR)
- Backend Swagger UI is great for testing APIs
- Both run in the same terminal with color-coded output
