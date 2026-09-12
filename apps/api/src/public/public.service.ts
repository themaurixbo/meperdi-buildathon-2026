import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { ApiException } from '../common/api-exception'
import { Tag } from '../tags/tag.entity'
import type { PublicTagProfileDto } from './public-tag-profile.dto'

@Injectable()
export class PublicService {
  constructor(@InjectRepository(Tag) private readonly tags: Repository<Tag>) {}

  /**
   * Replica exactamente `toPublicProfile()` de apps/web/src/mocks/db.ts: SUSPENDED,
   * DEACTIVATED y UNCLAIMED nunca exponen el item, aunque exista y esté vinculado.
   */
  async getPublicProfile(publicSlug: string): Promise<PublicTagProfileDto> {
    const tag = await this.tags.findOne({ where: { publicSlug }, relations: { item: true } })
    if (!tag) {
      throw new ApiException('tag_not_found', 'No encontramos este tag.', 404)
    }

    const exposeItem = tag.item != null && tag.status !== 'SUSPENDED' && tag.status !== 'DEACTIVATED' && tag.status !== 'UNCLAIMED'
    const item = exposeItem ? tag.item! : null

    return {
      publicSlug: tag.publicSlug,
      tagStatus: tag.status,
      itemType: item?.type ?? null,
      name: item?.name ?? null,
      photoUrl: item?.photoUrl ?? null,
      supportPhotoUrls: item?.supportPhotoUrls ?? [],
      publicMessage: item?.publicMessage ?? null,
      petDetails: item?.petDetails ?? null,
      objectDetails: item?.objectDetails ?? null,
      contacts: item
        ? item.contacts
            .filter((c) => c.visiblePublicly)
            .sort((a, b) => a.priority - b.priority)
            .map((c) => ({
              id: c.id,
              label: c.label,
              channels: c.channels,
              priority: c.priority,
              phoneE164: c.phoneE164,
              schedule: c.schedule,
            }))
        : [],
      lostReport: item?.lostReport ?? null,
    }
  }
}
