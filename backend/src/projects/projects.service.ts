import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Project } from './entities/project.entity';
import { User } from '../users/entities/user.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * ProjectsService - Business logic for project operations.
 * Handles CRUD with proper relationship validation.
 */
@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  /**
   * Create a new project with owner relationship validation.
   * Validates that owner exists before creating project.
   */
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    // Validate owner exists
    const owner = await this.userRepository.findOne({
      where: { id: createProjectDto.ownerId, deletedAt: IsNull() },
    });

    if (!owner) {
      throw new NotFoundException(
        `User with ID ${createProjectDto.ownerId} not found`,
      );
    }

    // Create project with relationship
    const project = this.projectRepository.create({
      ...createProjectDto,
      owner,
    });

    return this.projectRepository.save(project);
  }

  /**
   * Get all projects (excluding soft-deleted).
   */
  async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      where: { deletedAt: IsNull() },
      relations: ['owner', 'tasks'], // Load relationships
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get project by ID with relationships loaded.
   */
  async findOne(id: string): Promise<Project> {
    const project = await this.projectRepository.findOne({
      where: { id, deletedAt: IsNull() },
      relations: ['owner', 'tasks'],
    });

    if (!project) {
      throw new NotFoundException(`Project with ID ${id} not found`);
    }

    return project;
  }

  /**
   * Update project.
   */
  async update(id: string, updateProjectDto: UpdateProjectDto): Promise<Project> {
    const project = await this.findOne(id);

    // Validate owner if being updated
    if (updateProjectDto.ownerId) {
      const owner = await this.userRepository.findOne({
        where: { id: updateProjectDto.ownerId, deletedAt: IsNull() },
      });

      if (!owner) {
        throw new NotFoundException(
          `User with ID ${updateProjectDto.ownerId} not found`,
        );
      }

      project.owner = owner;
    }

    Object.assign(project, updateProjectDto);
    return this.projectRepository.save(project);
  }

  /**
   * Soft delete project.
   */
  async remove(id: string): Promise<void> {
    const project = await this.findOne(id);
    await this.projectRepository.softDelete(id);
  }

  /**
   * Get all projects for a specific user.
   */
  async findByOwner(ownerId: string): Promise<Project[]> {
    return this.projectRepository.find({
      where: { ownerId, deletedAt: IsNull() },
      relations: ['tasks'],
      order: { createdAt: 'DESC' },
    });
  }
}
