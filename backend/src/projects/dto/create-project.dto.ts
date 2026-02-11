import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new project.
 * Requires ownerId to establish relationship with User.
 */
export class CreateProjectDto {
  @ApiProperty({ example: 'My Project' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'Project description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'user-uuid-here', description: 'Owner user ID' })
  @IsUUID()
  @IsNotEmpty()
  ownerId: string;
}
