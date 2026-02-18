/**
 * PRISMA TRANSACTION EXAMPLE
 * 
 * Demonstrates how to use Prisma transactions for multi-table operations.
 * Useful for operations that need to be atomic (all succeed or all fail).
 */

import { PrismaService } from '../../prisma/prisma.service';

export class TransactionExampleService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Example: Create user with initial project in a transaction.
   * If project creation fails, user creation is rolled back.
   */
  async createUserWithProject(userData: { email: string; password: string; name?: string }, projectName: string) {
    return this.prisma.$transaction(async (tx) => {
      // Step 1: Create user
      const user = await tx.user.create({
        data: {
          email: userData.email,
          password: userData.password, // Should be hashed before this
          name: userData.name,
        },
      });

      // Step 2: Create project linked to user
      const project = await tx.project.create({
        data: {
          name: projectName,
          ownerId: user.id,
        },
      });

      // Step 3: Create initial task
      const task = await tx.task.create({
        data: {
          title: 'Welcome task',
          description: 'Get started with your first task',
          projectId: project.id,
        },
      });

      // If any step fails, entire transaction rolls back
      return { user, project, task };
    });
  }

  /**
   * Example: Update multiple records atomically.
   */
  async updateUserAndProjects(userId: string, newName: string, projectUpdates: { id: string; name: string }[]) {
    return this.prisma.$transaction(async (tx) => {
      // Update user
      const user = await tx.user.update({
        where: { id: userId },
        data: { name: newName },
      });

      // Update multiple projects
      const updatedProjects = await Promise.all(
        projectUpdates.map((update) =>
          tx.project.update({
            where: { id: update.id },
            data: { name: update.name },
          })
        )
      );

      return { user, projects: updatedProjects };
    });
  }

  /**
   * Example: Conditional transaction with error handling.
   */
  async conditionalTransaction(userId: string, shouldCreateProject: boolean) {
    try {
      return await this.prisma.$transaction(
        async (tx) => {
          const user = await tx.user.findUnique({ where: { id: userId } });
          if (!user) throw new Error('User not found');

          if (shouldCreateProject) {
            return await tx.project.create({
              data: {
                name: 'Auto-created project',
                ownerId: user.id,
              },
            });
          }
          return null;
        },
        {
          maxWait: 5000, // Max time to wait for transaction
          timeout: 10000, // Max time transaction can run
        }
      );
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  }
}
