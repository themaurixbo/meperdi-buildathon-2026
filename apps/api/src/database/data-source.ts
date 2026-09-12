import { DataSource } from 'typeorm'
import { buildTypeOrmOptions } from './typeorm-options'

/** Instancia plana para el CLI de TypeORM (`npm run migration:*` en apps/api). */
export default new DataSource(buildTypeOrmOptions())
