# Miniflow Monorepo

A monorepo workspace containing the Miniflow application with frontend and backend components.

## Workspace Structure

```
Miniflow/
├── projects/
│   └── frontend/          # Angular frontend application
├── Miniflow_Backend/      # .NET backend API
├── package.json           # Root package.json for frontend dependencies
├── angular.json           # Angular workspace configuration
└── tsconfig.json          # TypeScript configuration
```

## Prerequisites

- Node.js (v20.19.0+ or v22.12.0+ or v24.0.0+)
- npm 11.6.2+
- .NET SDK (for backend)

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

The backend is a .NET application located in `Miniflow_Backend/`.

See the backend directory for specific backend documentation.

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
