import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserTasksService } from './user-tasks.service';
import { CreateUserTaskDto } from './dto/create-user-task.dto';
import { UpdateUserTaskDto } from './dto/update-user-task.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('tasks')
@ApiBearerAuth()
@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class UserTasksController {
  constructor(private readonly userTasksService: UserTasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks for authenticated user' })
  findAll(@CurrentUser('id') userId: string) {
    return this.userTasksService.findAll(userId);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  create(@CurrentUser('id') userId: string, @Body() dto: CreateUserTaskDto) {
    return this.userTasksService.create(userId, dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  update(
    @CurrentUser('id') userId: string,
    @Param('id') id: string,
    @Body() dto: UpdateUserTaskDto,
  ) {
    return this.userTasksService.update(userId, id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  remove(@CurrentUser('id') userId: string, @Param('id') id: string) {
    return this.userTasksService.remove(userId, id);
  }
}
