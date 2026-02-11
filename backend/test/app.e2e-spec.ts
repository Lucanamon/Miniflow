import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

/**
 * E2E Test Example - Tests the entire application flow.
 * Run with: npm run test:e2e
 */
describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api (GET) should return API status', () => {
    return request(app.getHttpServer())
      .get('/api')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('service');
        expect(res.body).toHaveProperty('status');
      });
  });

  it('/api/health (GET) should return health status', () => {
    return request(app.getHttpServer())
      .get('/api/health')
      .expect(200)
      .expect((res: request.Response) => {
        expect(res.body).toHaveProperty('status');
      });
  });
});
