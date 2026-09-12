import { Controller, ForbiddenException, Get, Query } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import type { DataSource } from 'typeorm'
import { ApiException } from '../common/api-exception'
import { runSeed } from '../database/seed-data'

/**
 * Puerta de emergencia para correr migraciones/semillas en un cPanel sin terminal
 * (sección 4 de DEPLOY_CPANEL.md). Solo funciona si SETUP_SECRET está definido en el
 * .env del servidor — si no está, esta ruta se niega siempre (falla cerrado a propósito).
 * Quita SETUP_SECRET del .env una vez que termines de configurar el servidor.
 */
@Controller('setup')
export class SetupController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get('run')
  async run(@Query('key') key?: string): Promise<{ migrationsRun: string[]; seed: string[] }> {
    const secret = process.env.SETUP_SECRET
    if (!secret) {
      throw new ForbiddenException('SETUP_SECRET no está configurado en el servidor.')
    }
    if (key !== secret) {
      throw new ApiException('invalid_key', 'Clave incorrecta.', 403)
    }

    const executed = await this.dataSource.runMigrations()
    const seed = await runSeed(this.dataSource)

    return { migrationsRun: executed.map((m) => m.name), seed }
  }
}
