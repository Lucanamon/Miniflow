import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return API status', () => {
    const status = service.getStatus();
    expect(status).toHaveProperty('service');
    expect(status).toHaveProperty('status');
    expect(status.status).toBe('running');
  });
});
