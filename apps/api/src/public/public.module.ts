import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Tag } from '../tags/tag.entity'
import { PublicController } from './public.controller'
import { PublicService } from './public.service'

@Module({
  imports: [TypeOrmModule.forFeature([Tag])],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
