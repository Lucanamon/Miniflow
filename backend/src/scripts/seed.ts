import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Project } from '../projects/entities/project.entity';
import { Task } from '../tasks/entities/task.entity';

/**
 * Seed script example - Populates database with sample data.
 * 
 * To run: npm run seed
 * Or: ts-node src/scripts/seed.ts
 */
async function seed() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'miniflow',
    password: process.env.DB_PASSWORD || 'miniflowpass',
    database: process.env.DB_DATABASE || 'miniflowdb',
    entities: [User, Project, Task],
    synchronize: false,
  });

  await dataSource.initialize();

  const userRepository = dataSource.getRepository(User);
  const projectRepository = dataSource.getRepository(Project);
  const taskRepository = dataSource.getRepository(Task);

  try {
    // Create sample user
    const hashedPassword = await bcrypt.hash('password123', 10);
    const user = userRepository.create({
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    });
    const savedUser = await userRepository.save(user);
    console.log('✅ Created user:', savedUser.email);

    // Create sample project
    const project = projectRepository.create({
      name: 'My First Project',
      description: 'A sample project for testing',
      owner: savedUser,
    });
    const savedProject = await projectRepository.save(project);
    console.log('✅ Created project:', savedProject.name);

    // Create sample tasks
    const tasks = [
      { title: 'Setup database', completed: true },
      { title: 'Create API endpoints', completed: false },
      { title: 'Write tests', completed: false },
    ];

    for (const taskData of tasks) {
      const task = taskRepository.create({
        ...taskData,
        project: savedProject,
      });
      await taskRepository.save(task);
      console.log(`✅ Created task: ${task.title}`);
    }

    console.log('\n🎉 Seed completed successfully!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
