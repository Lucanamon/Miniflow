import { Test, TestingModule } from '@nestjs/testing';
import { UsersPrismaController } from './users-prisma.controller';
import { UsersPrismaService } from './users-prisma.service';
import { CreateUserDto } from './dto/create-user.dto';

describe('UsersPrismaController', () => {
  let controller: UsersPrismaController;
  let service: UsersPrismaService;

  const mockUsersPrismaService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    saveProgression: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersPrismaController],
      providers: [
        {
          provide: UsersPrismaService,
          useValue: mockUsersPrismaService,
        },
      ],
    }).compile();

    controller = module.get<UsersPrismaController>(UsersPrismaController);
    service = module.get<UsersPrismaService>(UsersPrismaService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a user', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const expectedResult = {
        id: 'user-uuid',
        ...createUserDto,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersPrismaService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);

      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const mockResult = {
        data: [{ id: '1', email: 'user1@example.com' }],
        total: 1,
        page: 1,
        limit: 10,
      };

      mockUsersPrismaService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll('1', '10');

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const mockUser = {
        id: 'user-uuid',
        email: 'test@example.com',
        name: 'Test User',
        projects: [],
      };

      mockUsersPrismaService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne('user-uuid');

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith('user-uuid');
    });
  });
});
