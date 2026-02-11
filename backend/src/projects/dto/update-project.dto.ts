import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

/**
 * DTO for updating a project.
 * All fields are optional.
 */
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
