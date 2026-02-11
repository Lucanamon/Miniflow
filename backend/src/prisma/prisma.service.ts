import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService - Extends PrismaClient for NestJS integration.
 * Handles connection lifecycle and graceful shutdown.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Connect to database when module initializes.
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * Disconnect from database when module destroys.
   * Ensures graceful shutdown.
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }

  /**
   * Helper method for soft delete queries.
   * Returns records where deletedAt is null.
   */
  excludeDeleted<T extends { deletedAt: Date | null }>(
    model: T | null,
  ): T | null {
    if (!model || model.deletedAt) {
      return null;
    }
    return model;
  }

  /**
   * Helper method for soft delete array queries.
   */
  excludeDeletedMany<T extends { deletedAt: Date | null }>(
    models: T[],
  ): T[] {
    return models.filter((model) => !model.deletedAt);
  }
}
