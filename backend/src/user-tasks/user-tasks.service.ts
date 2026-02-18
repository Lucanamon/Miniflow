import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';
import { User } from '@prisma/client';

@Injectable()
export class UserTasksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.userTask.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(userId: string, dto: CreateUserTaskDto) {
    return this.prisma.userTask.create({
      data: {
        userId,
        title: dto.title,
        board: dto.board ?? 'Today',
        dueTime: dto.dueTime,
        completed: dto.completed ?? false,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateUserTaskDto) {
    await this.ensureOwnership(userId, id);
    return this.prisma.userTask.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.board !== undefined && { board: dto.board }),
        ...(dto.dueTime !== undefined && { dueTime: dto.dueTime }),
        ...(dto.completed !== undefined && { completed: dto.completed }),
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.ensureOwnership(userId, id);
    await this.prisma.userTask.delete({ where: { id } });
    return { message: 'Task deleted successfully' };
  }

  private async ensureOwnership(userId: string, taskId: string) {
    const task = await this.prisma.userTask.findFirst({
      where: { id: taskId, userId },
    });
    if (!task) {
      throw new NotFoundException(`Task with ID ${taskId} not found`);
    }
    return task;
  }
}
