import { IsEmail, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * DTO for save progression endpoint.
 * Accepts partial updates - used for frontend autosave functionality.
 * Email is required to identify the user record.
 */
export class SaveUserDto {
  @ApiProperty({ example: 'user@example.com', description: 'Required to identify user' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  // Note: Password updates should be handled via separate secure endpoint
  // Not included here for security reasons
}
