import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ProjectsPrismaService } from './projects-prisma.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * ProjectsPrismaController - REST API endpoints using Prisma ORM.
 * Demonstrates relational queries with include().
 */
@ApiTags('projects-prisma')
@Controller('projects-prisma')
export class ProjectsPrismaController {
  constructor(private readonly projectsPrismaService: ProjectsPrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create project with transaction (Prisma)' })
  async create(@Body() createProjectDto: CreateProjectDto) {
    return this.projectsPrismaService.create(createProjectDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all projects with relationships (Prisma)' })
  @ApiQuery({ name: 'ownerId', required: false, description: 'Filter by owner ID' })
  async findAll(@Query('ownerId') ownerId?: string) {
    if (ownerId) {
      return this.projectsPrismaService.findByOwner(ownerId);
    }
    return this.projectsPrismaService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get project by ID with nested relations (Prisma)' })
  async findOne(@Param('id') id: string) {
    return this.projectsPrismaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update project (Prisma)' })
  async update(@Param('id') id: string, @Body() updateProjectDto: UpdateProjectDto) {
    return this.projectsPrismaService.update(id, updateProjectDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete project (Prisma)' })
  async remove(@Param('id') id: string) {
    await this.projectsPrismaService.remove(id);
    return { message: 'Project deleted successfully' };
  }
}
