import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should exclude deleted records', () => {
    const record = { id: '1', deletedAt: null };
    const deletedRecord = { id: '2', deletedAt: new Date() };

    expect(service.excludeDeleted(record)).toEqual(record);
    expect(service.excludeDeleted(deletedRecord)).toBeNull();
    expect(service.excludeDeleted(null)).toBeNull();
  });

  it('should exclude deleted records from array', () => {
    const records = [
      { id: '1', deletedAt: null },
      { id: '2', deletedAt: new Date() },
      { id: '3', deletedAt: null },
    ];

    const filtered = service.excludeDeletedMany(records);
    expect(filtered).toHaveLength(2);
    expect(filtered[0].id).toBe('1');
    expect(filtered[1].id).toBe('3');
  });
});
