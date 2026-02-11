import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

/**
 * Seed script - Populates database with sample data.
 * 
 * To run: npx prisma db seed
 * Or: npm run seed
 */
async function main() {
  console.log('🌱 Starting seed...');

  // Create sample user
  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User',
    },
  });
  console.log('✅ Created user:', user.email);

  // Create sample project
  const project = await prisma.project.upsert({
    where: { id: user.id }, // Using upsert pattern
    update: {},
    create: {
      name: 'My First Project',
      description: 'A sample project for testing Prisma',
      ownerId: user.id,
    },
  });
  console.log('✅ Created project:', project.name);

  // Create sample tasks
  const tasks = [
    { title: 'Setup Prisma', completed: true },
    { title: 'Create API endpoints', completed: false },
    { title: 'Write tests', completed: false },
  ];

  for (const taskData of tasks) {
    const task = await prisma.task.create({
      data: {
        ...taskData,
        projectId: project.id,
      },
    });
    console.log(`✅ Created task: ${task.title}`);
  }

  // Demonstrate relational query
  const userWithProjects = await prisma.user.findUnique({
    where: { id: user.id },
    include: {
      projects: {
        include: {
          tasks: true,
        },
      },
    },
  });

  console.log('\n📊 User with projects and tasks:');
  console.log(`User: ${userWithProjects?.name}`);
  console.log(`Projects: ${userWithProjects?.projects.length}`);
  console.log(`Total Tasks: ${userWithProjects?.projects.reduce((sum, p) => sum + p.tasks.length, 0)}`);

  console.log('\n🎉 Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
