import 'dotenv/config'
import type { DataSourceOptions } from 'typeorm'
import { Tag } from '../tags/tag.entity'
import { Item } from '../items/item.entity'

/**
 * Config compartida por el módulo de Nest (app.module.ts) y el DataSource plano que
 * usa el CLI de TypeORM para migraciones (data-source.ts) — una sola fuente de verdad
 * para no desincronizar credenciales/entidades entre ambos.
 */
export function buildTypeOrmOptions(): DataSourceOptions {
  return {
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'meperdi_dev',
    entities: [Tag, Item],
    migrations: [__dirname + '/migrations/*.{js,ts}'],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
  }
}
