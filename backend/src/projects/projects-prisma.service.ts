import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * ProjectsPrismaService - Project operations using Prisma ORM.
 * Demonstrates relational queries with include() and transaction support.
 */
@Injectable()
export class ProjectsPrismaService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new project with owner relationship validation.
   * Uses Prisma transaction for atomic operation.
   */
  async create(createProjectDto: CreateProjectDto) {
    // Validate owner exists using transaction
    return this.prisma.$transaction(async (tx) => {
      const owner = await tx.user.findFirst({
        where: {
          id: createProjectDto.ownerId,
          deletedAt: null,
        },
      });

      if (!owner) {
        throw new NotFoundException(
          `User with ID ${createProjectDto.ownerId} not found`,
        );
      }

      // Create project with relationship
      return tx.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          ownerId: createProjectDto.ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get all projects with relationships loaded.
   * Demonstrates Prisma include() for relational queries.
   */
  async findAll() {
    return this.prisma.project.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            title: true,
            completed: true,
          },
        },
        _count: {
          select: {
            tasks: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Get project by ID with nested relationships.
   */
  async findOne(id: string) {
    const project = await this.prisma.project.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        tasks: {
          where: {
            deletedAt: null,
          },
          include: {
            project: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Update project.
   */
  async update(id: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.findOne(id);

    // Validate owner if being updated
    if (updateProjectDto.ownerId) {
      const owner = await this.prisma.user.findFirst({
        where: {
          id: updateProjectDto.ownerId,
          deletedAt: null,
        },
      });

      if (!owner) {
        throw new NotFoundException(
          `User with ID ${updateProjectDto.ownerId} not found`,
        );
      }
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });
  }

  /**
   * Soft delete project.
   */
  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.project.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  /**
   * Get all projects for a specific user.
   * Demonstrates filtering by relation.
   */
  async findByOwner(ownerId: string) {
    return this.prisma.project.findMany({
      where: {
        ownerId,
        deletedAt: null,
      },
      include: {
        tasks: {
          where: {
            deletedAt: null,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  /**
   * Transaction example: Create project with initial task.
   * Demonstrates multi-table operations in a transaction.
   */
  async createWithTask(
    createProjectDto: CreateProjectDto,
    taskTitle: string,
  ) {
    return this.prisma.$transaction(async (tx) => {
      // Validate owner
      const owner = await tx.user.findFirst({
        where: {
          id: createProjectDto.ownerId,
          deletedAt: null,
        },
      });

      if (!owner) {
        throw new NotFoundException('Owner not found');
      }

      // Create project
      const project = await tx.project.create({
        data: {
          name: createProjectDto.name,
          description: createProjectDto.description,
          ownerId: createProjectDto.ownerId,
        },
      });

      // Create task in same transaction
      const task = await tx.task.create({
        data: {
          title: taskTitle,
          projectId: project.id,
        },
      });

      return {
        project,
        task,
      };
    });
  }
}
