import { Module } from '@nestjs/common';
import { TasksPrismaService } from './tasks-prisma.service';
import { TasksPrismaController } from './tasks-prisma.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [TasksPrismaController],
  providers: [TasksPrismaService],
  exports: [TasksPrismaService],
})
export class TasksPrismaModule {}
