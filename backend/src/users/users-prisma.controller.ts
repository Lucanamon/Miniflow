import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { UsersPrismaService } from './users-prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveUserDto } from './dto/save-user.dto';

/**
 * UsersPrismaController - REST API endpoints using Prisma ORM.
 * Demonstrates CRUD operations and save progression.
 */
@ApiTags('users-prisma')
@Controller('users-prisma')
export class UsersPrismaController {
  constructor(private readonly usersPrismaService: UsersPrismaService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user (Prisma)' })
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersPrismaService.create(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users with pagination (Prisma)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.usersPrismaService.findAll(pageNum, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID with projects (Prisma)' })
  async findOne(@Param('id') id: string) {
    return this.usersPrismaService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user (Prisma)' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersPrismaService.update(id, updateUserDto);
  }

  @Post('save')
  @ApiOperation({
    summary: 'Save progression - Upsert user (Prisma)',
    description: 'Uses Prisma upsert() for atomic update-or-create',
  })
  async saveProgression(@Body() saveUserDto: SaveUserDto) {
    return this.usersPrismaService.saveProgression(saveUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user (Prisma)' })
  async remove(@Param('id') id: string) {
    await this.usersPrismaService.remove(id);
    return { message: 'User deleted successfully' };
  }
}
