# Miniflow Monorepo

A monorepo workspace containing the Miniflow application with Angular frontend and ASP.NET backend.

## Workspace Structure

```
Miniflow/
├── frontend/              # Angular frontend application
├── backend/               # ASP.NET Core Web API backend
├── package.json           # Root package.json for frontend dependencies
├── angular.json           # Angular workspace configuration
└── tsconfig.json          # TypeScript configuration
```

## Prerequisites

- Node.js (v20.19.0+ or v22.12.0+ or v24.0.0+)
- npm 11.6.2+
- .NET 8.0 SDK (for backend)

## Frontend Development

The frontend is an Angular 21 application with SSR (Server-Side Rendering) support.

### Available Scripts

- `npm start` or `npm run start:frontend` - Start development server
- `npm run build` or `npm run build:frontend` - Build for development
- `npm run build:frontend:prod` - Build for production
- `npm run watch` - Build and watch for changes
- `npm test` or `npm run test:frontend` - Run unit tests
- `npm run serve:ssr:frontend` - Serve SSR build

### Development Server

To start the frontend development server:

```bash
npm start
```

The application will be available at `http://localhost:4200/` and will automatically reload on file changes.

### Building

Build the frontend application:

```bash
# Development build
npm run build

# Production build
npm run build:frontend:prod
```

Build artifacts will be stored in `dist/frontend/`.

### Server-Side Rendering (SSR)

The frontend includes SSR support. After building, you can serve the SSR version:

```bash
npm run build:frontend:prod
npm run serve:ssr:frontend
```

## Backend Development

The backend is an ASP.NET Core Web API application located in `backend/`.

### Available Scripts

- `npm run start:backend` - Start the backend server
- `npm run watch:backend` - Start with hot reload (watch mode)
- `npm run build:backend` - Build the backend
- `npm run test:backend` - Run backend tests

### Development Server

To start the backend:

```bash
npm run start:backend
# or
npm run watch:backend  # for hot reload
```

The API will be available at `http://localhost:5000` and Swagger UI at `http://localhost:5000/swagger`.

See the `backend/README.md` for more detailed backend documentation.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component:

```bash
ng generate component component-name --project=frontend
```

Or use the shorthand:

```bash
ng g c component-name --project=frontend
```

For a complete list of available schematics:

```bash
ng generate --help
```

## Adding New Projects

To add a new Angular application to the monorepo:

```bash
ng generate application project-name --routing --style=scss --ssr
```

## Additional Resources

- [Angular CLI Documentation](https://angular.dev/tools/cli)
- [Angular SSR Guide](https://angular.dev/guide/ssr)
- [ASP.NET Core Documentation](https://learn.microsoft.com/en-us/aspnet/core/)
