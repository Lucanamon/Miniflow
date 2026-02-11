import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for creating a new task.
 * Requires projectId to establish relationship with Project.
 */
export class CreateTaskDto {
  @ApiProperty({ example: 'Complete feature' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Task description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;

  @ApiProperty({ example: 'project-uuid-here', description: 'Project ID' })
  @IsUUID()
  @IsNotEmpty()
  projectId: string;
}
