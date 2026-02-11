import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { Project } from '../../projects/entities/project.entity';

/**
 * Task entity - belongs to a Project.
 * Part of the relationship chain: User -> Project -> Task
 */
@Entity('tasks')
export class Task extends BaseEntity {
  @Column()
  title: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ default: false })
  completed: boolean;

  // ManyToOne relationship: Many Tasks belong to one Project
  @ManyToOne(() => Project, (project) => project.tasks, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @Column()
  projectId: string;
}
