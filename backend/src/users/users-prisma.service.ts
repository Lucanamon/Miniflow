import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveUserDto } from './dto/save-user.dto';
import * as bcrypt from 'bcrypt';

/**
 * UsersPrismaService - User operations using Prisma ORM.
 * Demonstrates CRUD, upsert, pagination, and soft delete patterns.
 */
@Injectable()
export class UsersPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new user with password hashing.
   */
  async create(createUserDto: CreateUserDto) {
    // Check if user exists
    const existing = await this.prisma.user.findFirst({
      where: {
        email: createUserDto.email,
        deletedAt: null,
      },
    });

    if (existing) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    return this.prisma.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Password excluded automatically
      },
    });
  }

  /**
   * Get all users (excluding soft-deleted) with pagination.
   */
  async findAll(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      this.prisma.user.count({
        where: {
          deletedAt: null,
        },
      }),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  /**
   * Get user by ID (excluding soft-deleted).
   */
  async findOne(id: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        projects: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Find user by email (excluding soft-deleted).
   */
  async findByEmail(email: string) {
    return this.prisma.user.findFirst({
      where: {
        email,
        deletedAt: null,
      },
    });
  }

  /**
   * Update user by ID.
   */
  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verify user exists
    await this.findOne(id);

    // Hash password if provided
    const updateData: any = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Check email uniqueness if email is being updated
    if (updateUserDto.email) {
      const existing = await this.findByEmail(updateUserDto.email);
      if (existing && existing.id !== id) {
        throw new ConflictException('User with this email already exists');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Save progression: Upsert logic (update or create).
   * Uses Prisma upsert() for atomic operation.
   */
  async saveProgression(saveUserDto: SaveUserDto) {
    return this.prisma.user.upsert({
      where: {
        email: saveUserDto.email,
      },
      update: {
        name: saveUserDto.name,
        // Only update provided fields
      },
      create: {
        email: saveUserDto.email,
        name: saveUserDto.name,
        password: await bcrypt.hash('temp_password', 10), // Temporary, should be set via registration
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Soft delete user (sets deletedAt timestamp).
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Hard delete user (permanently removes from database).
   * Use with caution!
   */
  async hardDelete(id: string) {
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
    });
  }
}
