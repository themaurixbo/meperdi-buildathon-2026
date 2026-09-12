import type { ItemType, TagStatus } from '@meperdi/domain'
import type { ContactJson, LostReportJson, ObjectDetailsJson, PetDetailsJson } from '../items/item.entity'

export interface PublicContactDto {
  id: string
  label: string
  channels: ContactJson['channels']
  priority: number
  phoneE164: string
  schedule?: string
}

/**
 * Forma pública del tag — nunca domicilio, apellidos, documentos ni datos privados
 * (sección 6, 9 y 10). Idéntica a `TagPublicProfile` en
 * `packages/api-client/src/types.ts`.
 */
export interface PublicTagProfileDto {
  publicSlug: string
  tagStatus: TagStatus
  itemType: ItemType | null
  name: string | null
  photoUrl: string | null
  supportPhotoUrls: string[]
  publicMessage: string | null
  petDetails: PetDetailsJson | null
  objectDetails: ObjectDetailsJson | null
  contacts: PublicContactDto[]
  lostReport: LostReportJson | null
}
