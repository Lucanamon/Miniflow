import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * DTO for updating a user.
 * All fields are optional - extends CreateUserDto with PartialType.
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
