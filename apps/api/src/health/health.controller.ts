import { Controller, Get } from '@nestjs/common'
import { InjectDataSource } from '@nestjs/typeorm'
import type { DataSource } from 'typeorm'

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  async check(): Promise<{ status: 'ok'; db: boolean }> {
    let db = false
    try {
      await this.dataSource.query('SELECT 1')
      db = true
    } catch {
      db = false
    }
    return { status: 'ok', db }
  }
}
