import { Controller, Get, Post, Body, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task } from './entities/task.entity';

/**
 * TasksController - REST API endpoints for task management.
 * Handles CRUD operations with Project relationship.
 */
@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    return this.tasksService.create(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiQuery({ name: 'projectId', required: false, description: 'Filter by project ID' })
  async findAll(@Query('projectId') projectId?: string): Promise<Task[]> {
    if (projectId) {
      return this.tasksService.findByProject(projectId);
    }
    return this.tasksService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  async findOne(@Param('id') id: string): Promise<Task> {
    return this.tasksService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete task' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.tasksService.remove(id);
    return { message: 'Task deleted successfully' };
  }
}
