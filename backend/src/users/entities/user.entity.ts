import { Entity, Column, Index, OneToMany } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Project } from '../../projects/entities/project.entity';

/**
 * User entity - extends BaseEntity for timestamps and soft delete.
 * Uses UUID primary key, unique email, and hashed password storage.
 * Has many Projects (OneToMany relationship).
 */
@Entity('users')
export class User extends BaseEntity {
  @Column({ unique: true })
  @Index('IDX_USER_EMAIL')
  email: string;

  @Column()
  password: string; // Stored as bcrypt hash

  @Column({ nullable: true })
  name?: string;

  // OneToMany relationship: One User has many Projects
  @OneToMany(() => Project, (project) => project.owner)
  projects: Project[];
}
