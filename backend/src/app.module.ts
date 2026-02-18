import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersPrismaModule } from './users/users-prisma.module';
import { ProjectsPrismaModule } from './projects/projects-prisma.module';
import { TasksPrismaModule } from './tasks/tasks-prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserTasksModule } from './user-tasks/user-tasks.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { HealthController } from './health/health.controller';

/**
 * AppModule - Root module using Prisma ORM.
 * JWT guard applied globally; use @Public() for auth routes.
 */
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserTasksModule,
    UsersPrismaModule,
    ProjectsPrismaModule,
    TasksPrismaModule,
  ],
  controllers: [AppController, HealthController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule {}
