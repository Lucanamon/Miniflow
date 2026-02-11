import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

/**
 * Example migration: Create users table with UUID, timestamps, and soft delete.
 * 
 * To run migrations:
 * 1. npm run typeorm migration:run
 * 2. Or use TypeORM CLI: typeorm migration:run
 * 
 * To generate new migration:
 * typeorm migration:generate -n MigrationName
 */
export class CreateUsersTable1739289600000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension if not already enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // Create users table
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          {
            name: 'id',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'email',
            type: 'varchar',
            length: '255',
            isUnique: true,
            isNullable: false,
          },
          {
            name: 'password',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'name',
            type: 'varchar',
            length: '255',
            isNullable: true,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
            onUpdate: 'CURRENT_TIMESTAMP',
            isNullable: false,
          },
          {
            name: 'deletedAt',
            type: 'timestamp',
            isNullable: true,
          },
        ],
      }),
      true, // ifNotExists
    );

    // Create index on email for faster lookups
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_EMAIL',
        columnNames: ['email'],
        isUnique: true,
      }),
    );

    // Create index on deletedAt for soft delete queries
    await queryRunner.createIndex(
      'users',
      new TableIndex({
        name: 'IDX_USER_DELETED_AT',
        columnNames: ['deletedAt'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes first
    await queryRunner.dropIndex('users', 'IDX_USER_DELETED_AT');
    await queryRunner.dropIndex('users', 'IDX_USER_EMAIL');
    
    // Drop table
    await queryRunner.dropTable('users');
  }
}
