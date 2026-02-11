import { Module } from '@nestjs/common';
import { UsersPrismaService } from './users-prisma.service';
import { UsersPrismaController } from './users-prisma.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [UsersPrismaController],
  providers: [UsersPrismaService],
  exports: [UsersPrismaService],
})
export class UsersPrismaModule {}
