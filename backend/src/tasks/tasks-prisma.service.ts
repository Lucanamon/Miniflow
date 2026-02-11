import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

/**
 * TasksPrismaService - Task operations using Prisma ORM.
 * Demonstrates relational queries and cascade operations.
 */
@Injectable()
export class TasksPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new task with project relationship validation.
   */
  async create(createTaskDto: CreateTaskDto) {
    // Validate project exists
    const project = await this.prisma.project.findFirst({
      where: {
        id: createTaskDto.projectId,
        deletedAt: null,
      },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createTaskDto.projectId} not found`,
      );
    }

    // Create task
    return this.prisma.task.create({
      data: {
        title: createTaskDto.title,
        description: createTaskDto.description,
        completed: createTaskDto.completed ?? false,
        projectId: createTaskDto.projectId,
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Get all tasks with nested relationships.
   */
  async findAll() {
    return this.prisma.task.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get task by ID with relationships.
   */
  async findOne(id: string) {
    const task = await this.prisma.task.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        project: {
          include: {
            owner: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Get all tasks for a specific project.
   */
  async findByProject(projectId: string) {
    return this.prisma.task.findMany({
      where: {
        projectId,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Soft delete task.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.task.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }
}
