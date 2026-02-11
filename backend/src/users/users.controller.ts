import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { SaveUserDto } from './dto/save-user.dto';
import { User } from './entities/user.entity';
import { Exclude, Expose } from 'class-transformer';

/**
 * Response DTO that excludes password from API responses.
 * Used to ensure password is never returned to client.
 */
class UserResponseDto {
  @Expose()
  id: string;

  @Expose()
  email: string;

  @Expose()
  name?: string;

  @Expose()
  createdAt: Date;

  @Expose()
  updatedAt: Date;

  @Exclude()
  password: never; // Never include password in response

  @Exclude()
  deletedAt?: Date;
}

/**
 * UsersController - REST API endpoints for user management.
 * Handles CRUD operations and save progression endpoint.
 */
@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const user = await this.usersService.create(createUserDto);
    return this.excludePassword(user);
  }

  @Get()
  @ApiOperation({ summary: 'Get all users' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of users' })
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<UserResponseDto[] | { data: UserResponseDto[]; total: number; page: number; limit: number }> {
    if (page && limit) {
      // Pagination
      const result = await this.usersService.findWithPagination(
        parseInt(page, 10),
        parseInt(limit, 10),
      );
      return {
        ...result,
        data: result.data.map((user) => this.excludePassword(user)),
      };
    }
    // All users
    const users = await this.usersService.findAll();
    return users.map((user) => this.excludePassword(user));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string): Promise<UserResponseDto> {
    const user = await this.usersService.findOne(id);
    return this.excludePassword(user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.update(id, updateUserDto);
    return this.excludePassword(user);
  }

  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Save progression - Update or Create user',
    description:
      'Accepts partial updates for frontend autosave. Updates existing user or creates new one.',
  })
  @ApiResponse({ status: 200, description: 'User saved successfully' })
  @ApiResponse({ status: 400, description: 'Email required' })
  async saveProgression(
    @Body() saveUserDto: SaveUserDto,
  ): Promise<UserResponseDto> {
    const user = await this.usersService.saveProgression(saveUserDto);
    return this.excludePassword(user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete user' })
  @ApiParam({ name: 'id', description: 'User UUID' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.usersService.remove(id);
    return { message: 'User deleted successfully' };
  }

  /**
   * Helper method to exclude password from response.
   * Ensures password is never sent to client.
   */
  private excludePassword(user: User): UserResponseDto {
    const { password, deletedAt, ...result } = user;
    return result as unknown as UserResponseDto;
  }
}
