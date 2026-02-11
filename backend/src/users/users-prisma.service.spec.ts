import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersPrismaService } from './users-prisma.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

// Mock PrismaService
const mockPrismaService = {
  user: {
    findFirst: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('UsersPrismaService', () => {
  let service: UsersPrismaService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersPrismaService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersPrismaService>(UsersPrismaService);
    prisma = module.get<PrismaService>(PrismaService);

    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: 'user-uuid',
        email: createUserDto.email,
        name: createUserDto.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.create(createUserDto);

      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.user.create.mock.calls[0][0].data.password).not.toBe(
        createUserDto.password,
      ); // Password should be hashed
    });

    it('should throw ConflictException if user already exists', async () => {
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      mockPrismaService.user.findFirst.mockResolvedValue({
        id: 'existing-uuid',
        email: 'existing@example.com',
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        { id: '1', email: 'user1@example.com', name: 'User 1' },
        { id: '2', email: 'user2@example.com', name: 'User 2' },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.findAll(1, 10);

      expect(result.data).toEqual(mockUsers);
      expect(result.total).toBe(2);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        name: 'Test User',
        projects: [],
      };

      mockPrismaService.user.findFirst.mockResolvedValue(mockUser);

      const result = await service.findOne('user-uuid');

      expect(result).toEqual(mockUser);
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { id: 'user-uuid', deletedAt: null },
        select: expect.any(Object),
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrismaService.user.findFirst.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('saveProgression', () => {
    it('should upsert user successfully', async () => {
      const saveUserDto = {
        email: 'user@example.com',
        name: 'Updated Name',
      };

      mockPrismaService.user.upsert.mockResolvedValue({
        id: 'user-uuid',
        ...saveUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.saveProgression(saveUserDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.user.upsert).toHaveBeenCalled();
    });
  });
});
