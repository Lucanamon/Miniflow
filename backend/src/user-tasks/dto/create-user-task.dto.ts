import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserTaskDto {
  @ApiProperty({ example: 'Complete feature' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 'Today', required: false })
  @IsOptional()
  @IsString()
  board?: string;

  @ApiProperty({ example: '10:00 AM', required: false })
  @IsOptional()
  @IsString()
  dueTime?: string;

  @ApiProperty({ example: false, required: false })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
