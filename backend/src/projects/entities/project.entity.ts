import { Entity, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../common/base.entity';
import { User } from '../../users/entities/user.entity';
import { Task } from '../../tasks/entities/task.entity';

/**
 * Project entity - belongs to a User (owner).
 * Has many Tasks.
 */
@Entity('projects')
export class Project extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  // ManyToOne relationship: Many Projects belong to one User
  @ManyToOne(() => User, (user) => user.projects, { nullable: false })
  @JoinColumn({ name: 'ownerId' })
  owner: User;

  @Column()
  ownerId: string;

  // OneToMany relationship: One Project has many Tasks
  @OneToMany(() => Task, (task) => task.project, { cascade: true })
  tasks: Task[];
}
