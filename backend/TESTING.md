# NestJS Backend Testing Guide (Jest)

Complete Jest testing setup for NestJS backend with Prisma ORM.

## Quick Start

```bash
# 1. Install dependencies (includes Jest)
cd backend
npm install

# 2. Run tests
npm test

# 3. Run tests in watch mode
npm run test:watch

# 4. Run tests with coverage
npm run test:cov

# 5. Run E2E tests
npm run test:e2e
```

## Test Structure

### Unit Tests
- Location: `src/**/*.spec.ts`
- Tests individual services, controllers, and utilities
- Uses mocks for dependencies

### E2E Tests
- Location: `test/**/*.e2e-spec.ts`
- Tests entire application flow
- Uses real HTTP requests via supertest

## Test Files Created

### 1. `src/prisma/prisma.service.spec.ts`
Tests PrismaService:
- Service initialization
- Soft delete helper methods
- Array filtering utilities

### 2. `src/users/users-prisma.service.spec.ts`
Tests UsersPrismaService:
- User creation with password hashing
- Conflict handling (duplicate email)
- Pagination
- Find operations
- Upsert (save progression)

### 3. `src/users/users-prisma.controller.spec.ts`
Tests UsersPrismaController:
- Controller initialization
- Endpoint methods
- Service integration

### 4. `src/app.service.spec.ts`
Tests AppService:
- API status endpoint

### 5. `test/app.e2e-spec.ts`
E2E tests:
- Full HTTP request/response cycle
- API endpoints integration

## Configuration Files

### `jest.config.js`
Main Jest configuration:
- Test file pattern: `*.spec.ts`
- Coverage settings
- Module path mapping
- Test environment: Node.js

### `tsconfig.spec.json`
TypeScript config for tests:
- Extends main tsconfig
- Includes Jest types
- Test file patterns

### `test/jest-e2e.json`
E2E test configuration:
- Separate config for integration tests
- Different test file pattern: `*.e2e-spec.ts`

## Test Scripts

| Script | Description |
|--------|-------------|
| `npm test` | Run all unit tests once |
| `npm run test:watch` | Run tests in watch mode (auto-rerun on changes) |
| `npm run test:cov` | Run tests with coverage report |
| `npm run test:debug` | Run tests in debug mode |
| `npm run test:e2e` | Run E2E integration tests |

## Writing Tests

### Service Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyService } from './my.service';
import { PrismaService } from '../prisma/prisma.service';

describe('MyService', () => {
  let service: MyService;
  let prisma: PrismaService;

  const mockPrismaService = {
    model: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MyService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<MyService>(MyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should do something', async () => {
    mockPrismaService.model.findMany.mockResolvedValue([]);
    const result = await service.findAll();
    expect(result).toEqual([]);
  });
});
```

### Controller Test Example

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { MyController } from './my.controller';
import { MyService } from './my.service';

describe('MyController', () => {
  let controller: MyController;
  let service: MyService;

  const mockService = {
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MyController],
      providers: [
        {
          provide: MyService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<MyController>(MyController);
    service = module.get<MyService>(MyService);
  });

  it('should return data', async () => {
    mockService.findAll.mockResolvedValue([{ id: '1' }]);
    const result = await controller.findAll();
    expect(result).toEqual([{ id: '1' }]);
  });
});
```

## Mocking Prisma

When testing services that use Prisma, mock the PrismaService:

```typescript
const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  project: {
    // ... project methods
  },
};

// In beforeEach
{
  provide: PrismaService,
  useValue: mockPrismaService,
}
```

## Coverage

Coverage reports are generated in `coverage/` directory.

To view:
```bash
npm run test:cov
# Then open coverage/index.html in browser
```

## Best Practices

1. **Mock external dependencies** - Don't hit real database in unit tests
2. **Test behavior, not implementation** - Focus on what the code does, not how
3. **Use descriptive test names** - `it('should create user when email is unique')`
4. **Arrange-Act-Assert pattern** - Setup, execute, verify
5. **Clean mocks** - Use `jest.clearAllMocks()` in `beforeEach`
6. **Test edge cases** - Null, empty, error conditions
7. **Keep tests fast** - Unit tests should run quickly

## Next Steps

1. Install dependencies: `npm install`
2. Run tests: `npm test`
3. Add more test files as you create new services/controllers
4. Aim for >80% code coverage
