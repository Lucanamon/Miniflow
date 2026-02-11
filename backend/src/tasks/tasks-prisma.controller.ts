import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TasksPrismaService } from './tasks-prisma.service';
import { CreateTaskDto } from './dto/create-task.dto';

/**
 * TasksPrismaController - REST API endpoints using Prisma ORM.
 * Demonstrates relational queries and cascade operations.
 */
@ApiTags('tasks-prisma')
@Controller('tasks-prisma')
export class TasksPrismaController {
  constructor(private readonly tasksPrismaService: TasksPrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create task with project relationship (Prisma)' })
  async create(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksPrismaService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with relationships (Prisma)' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  async findAll(@Query('projectId') projectId?: string) {
    if (projectId) {
      return this.tasksPrismaService.findByProject(projectId);
    }
    return this.tasksPrismaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID with nested relations (Prisma)' })
  async findOne(@Param('id') id: string) {
    return this.tasksPrismaService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete task (Prisma)' })
  async remove(@Param('id') id: string) {
    await this.tasksPrismaService.remove(id);
    return { message: 'Task deleted successfully' };
  }
}
