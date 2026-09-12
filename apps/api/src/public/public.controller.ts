import { Controller, Get, Param } from '@nestjs/common'
import { PublicService } from './public.service'
import type { PublicTagProfileDto } from './public-tag-profile.dto'

@Controller('public/tags')
export class PublicController {
  constructor(private readonly publicService: PublicService) {}

  @Get(':publicSlug')
  getProfile(@Param('publicSlug') publicSlug: string): Promise<PublicTagProfileDto> {
    return this.publicService.getPublicProfile(publicSlug)
  }
}
