import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryRunner, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveUserDto } from './dto/save-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * UsersService - Business logic layer for user operations.
 * Handles CRUD operations, save progression, transactions, and password hashing.
 */
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new user with password hashing.
   * Throws ConflictException if user already exists.
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if user exists
    const existing = await this.userRepository.findOne({
      where: { email: createUserDto.email },
      withDeleted: false, // Exclude soft-deleted users
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  /**
   * Get all users (excluding soft-deleted).
   */
  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      where: { deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get user by ID.
   * Throws NotFoundException if user doesn't exist.
   */
  async findOne(id: string): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id, deletedAt: IsNull() },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email (excluding soft-deleted).
   * Returns null if not found.
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email, deletedAt: IsNull() },
    });
  }

  /**
   * Update user by ID.
   * Hashes password if provided in update data.
   */
  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);

    // Hash password if provided
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing) {
        throw new ConflictException('User with this email already exists');
      }
    }

    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  /**
   * Save progression: Update or Create logic.
   * Accepts partial data, merges with existing record.
   * Used for frontend autosave functionality.
   */
  async saveProgression(saveUserDto: SaveUserDto): Promise<User> {
    if (!saveUserDto.email) {
      throw new BadRequestException('Email is required for save progression');
    }

    const existing = await this.findByEmail(saveUserDto.email);

    if (existing) {
      // Update existing user with partial data
      Object.assign(existing, {
        name: saveUserDto.name ?? existing.name,
      });
      return this.userRepository.save(existing);
    } else {
      // Create new user (email already provided in DTO)
      // Note: Password not included in save progression for security
      const user = this.userRepository.create({
        email: saveUserDto.email,
        name: saveUserDto.name,
        password: await bcrypt.hash('temp_password', 10), // Temporary, should be set via proper registration
      });
      return this.userRepository.save(user);
    }
  }

  /**
   * Soft delete user (sets deletedAt timestamp).
   */
  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softDelete(id);
  }

  /**
   * Hard delete user (permanently removes from database).
   * Use with caution!
   */
  async hardDelete(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.remove(user);
  }

  /**
   * Transaction example: Create user with related operations.
   * Demonstrates how to use QueryRunner for multi-table transactions.
   */
  async createWithTransaction(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner: QueryRunner =
      this.userRepository.manager.connection.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Hash password
      const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

      // Create user within transaction
      const user = queryRunner.manager.create(User, {
        ...createUserDto,
        password: hashedPassword,
      });

      const savedUser = await queryRunner.manager.save(user);

      // Example: Create related records in same transaction
      // const profile = queryRunner.manager.create(UserProfile, {
      //   userId: savedUser.id,
      //   ...profileData,
      // });
      // await queryRunner.manager.save(profile);

      // Commit transaction
      await queryRunner.commitTransaction();
      return savedUser;
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  /**
   * Pagination example: Get users with pagination.
   */
  async findWithPagination(
    page: number = 1,
    limit: number = 10,
  ): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;

    const [data, total] = await this.userRepository.findAndCount({
      where: { deletedAt: IsNull() },
      skip,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }
}
