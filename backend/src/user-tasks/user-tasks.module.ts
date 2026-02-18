import { Module } from '@nestjs/common';
import { UserTasksController } from './user-tasks.controller';
import { UserTasksService } from './user-tasks.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UserTasksController],
  providers: [UserTasksService],
  exports: [UserTasksService],
})
export class UserTasksModule {}
