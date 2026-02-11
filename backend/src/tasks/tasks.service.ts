import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Task } from './entities/task.entity';
import { Project } from '../projects/entities/project.entity';
import { CreateTaskDto } from './dto/create-task.dto';

/**
 * TasksService - Business logic for task operations.
 * Handles CRUD with proper Project relationship validation.
 */
@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  /**
   * Create a new task with project relationship validation.
   */
  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    // Validate project exists
    const project = await this.projectRepository.findOne({
      where: { id: createTaskDto.projectId, deletedAt: IsNull() },
    });

    if (!project) {
      throw new NotFoundException(
        `Project with ID ${createTaskDto.projectId} not found`,
      );
    }

    // Create task with relationship
    const task = this.taskRepository.create({
      ...createTaskDto,
      project,
    });

    return this.taskRepository.save(task);
  }

  /**
   * Get all tasks (excluding soft-deleted).
   */
  async findAll(): Promise<Task[]> {
    return this.taskRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['project', 'project.owner'], // Load nested relationships
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get task by ID with relationships loaded.
   */
  async findOne(id: string): Promise<Task> {
    const task = await this.taskRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['project', 'project.owner'],
    });

    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    return task;
  }

  /**
   * Get all tasks for a specific project.
   */
  async findByProject(projectId: string): Promise<Task[]> {
    return this.taskRepository.find({
      where: { projectId, deletedAt: IsNull() },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Soft delete task.
   */
  async remove(id: string): Promise<void> {
    const task = await this.findOne(id);
    await this.taskRepository.softDelete(id);
  }
}
