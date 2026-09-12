import { MiddlewareConsumer, Module, type NestModule } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { buildTypeOrmOptions } from './database/typeorm-options'
import { RequestIdMiddleware } from './common/request-id.middleware'
import { HealthModule } from './health/health.module'
import { PublicModule } from './public/public.module'
import { SetupModule } from './setup/setup.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(buildTypeOrmOptions()),
    HealthModule,
    PublicModule,
    SetupModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestIdMiddleware).forRoutes('*splat')
  }
}
