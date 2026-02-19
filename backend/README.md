# Miniflow Backend

ASP.NET Core Web API backend for the Miniflow application.

## Prerequisites

- .NET 8.0 SDK or later
- Visual Studio 2022, VS Code, or Rider (optional)

## Getting Started

### Restore Dependencies

```bash
dotnet restore
```

### Run the Application

```bash
# From the root of the monorepo
npm run start:backend

# Or directly with dotnet
dotnet run --project backend/Miniflow.Backend.csproj

# Watch mode (auto-reload on changes)
npm run watch:backend
```

The API will be available at:
- HTTP: http://localhost:5000
- Swagger UI: http://localhost:5000/swagger

## Project Structure

```
backend/
├── Controllers/          # API Controllers
├── Properties/           # Launch settings
├── Program.cs            # Application entry point
├── appsettings.json      # Configuration
└── Miniflow.Backend.csproj
```

## API Endpoints

The default template includes a WeatherForecast controller for testing. You can access it at:
- GET `/WeatherForecast`

## Configuration

- CORS is configured to allow requests from `http://localhost:4200` (Angular dev server)
- The API runs on port 5000 by default (configured in `Properties/launchSettings.json`)
- Swagger UI is enabled in Development mode

## Building

```bash
npm run build:backend
# or
dotnet build backend/Miniflow.Backend.csproj
```

## Testing

```bash
npm run test:backend
# or
dotnet test backend/Miniflow.Backend.csproj
```
