import type { MigrationInterface, QueryRunner } from 'typeorm'

/** Hito 1 — esquema mínimo: tags + items, suficiente para GET /api/public/tags/:slug. */
export class InitSchema1738900000000 implements MigrationInterface {
  name = 'InitSchema1738900000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "tags_status_enum" AS ENUM (
        'UNCLAIMED', 'ACTIVE', 'LOST', 'RETURN_PENDING', 'RETURNED', 'SUSPENDED', 'DEACTIVATED'
      )
    `)
    await queryRunner.query(`CREATE TYPE "items_type_enum" AS ENUM ('pet', 'object')`)

    // Los id se generan en la aplicación (Tag/Item entity, @BeforeInsert), no acá —
    // no podemos asumir que el hosting tenga pgcrypto/uuid-ossp habilitado.
    await queryRunner.query(`
      CREATE TABLE "items" (
        "id" uuid NOT NULL,
        "type" "items_type_enum" NOT NULL,
        "name" character varying(40) NOT NULL,
        "photoUrl" character varying,
        "supportPhotoUrls" jsonb NOT NULL DEFAULT '[]',
        "publicMessage" character varying(280),
        "petDetails" jsonb,
        "objectDetails" jsonb,
        "contacts" jsonb NOT NULL DEFAULT '[]',
        "lostReport" jsonb,
        CONSTRAINT "PK_items_id" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(`
      CREATE TABLE "tags" (
        "id" uuid NOT NULL,
        "publicSlug" character varying(80) NOT NULL,
        "status" "tags_status_enum" NOT NULL DEFAULT 'UNCLAIMED',
        "activationPinHash" character varying NOT NULL,
        "itemId" uuid,
        CONSTRAINT "PK_tags_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_tags_publicSlug" UNIQUE ("publicSlug"),
        CONSTRAINT "FK_tags_itemId" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "tags"`)
    await queryRunner.query(`DROP TABLE "items"`)
    await queryRunner.query(`DROP TYPE "items_type_enum"`)
    await queryRunner.query(`DROP TYPE "tags_status_enum"`)
  }
}
