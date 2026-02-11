import { Module } from '@nestjs/common';
import { ProjectsPrismaService } from './projects-prisma.service';
import { ProjectsPrismaController } from './projects-prisma.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsPrismaController],
  providers: [ProjectsPrismaService],
  exports: [ProjectsPrismaService],
})
export class ProjectsPrismaModule {}
