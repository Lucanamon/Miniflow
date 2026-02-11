import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersPrismaModule } from './users/users-prisma.module';
import { ProjectsPrismaModule } from './projects/projects-prisma.module';
import { TasksPrismaModule } from './tasks/tasks-prisma.module';
import { HealthController } from './health/health.controller';

/**
 * AppModule - Root module using Prisma ORM.
 * PrismaModule is global, so PrismaService is available everywhere.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule, // Global module - provides PrismaService
    UsersPrismaModule,
    ProjectsPrismaModule,
    TasksPrismaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
