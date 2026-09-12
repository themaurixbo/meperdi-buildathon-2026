import type { MigrationInterface, QueryRunner } from 'typeorm'

/** Cuenta real de dueño/finder — login con Google. */
export class CreateUsers1757640000000 implements MigrationInterface {
  name = 'CreateUsers1757640000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL,
        "googleId" character varying,
        "email" character varying NOT NULL,
        "displayName" character varying NOT NULL,
        "photoUrl" character varying,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_users_googleId" UNIQUE ("googleId"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email")
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "users"`)
  }
}
