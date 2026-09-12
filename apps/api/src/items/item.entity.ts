import { randomUUID } from 'node:crypto'
import { BeforeInsert, Column, Entity, PrimaryColumn } from 'typeorm'
import { ITEM_TYPES, type ItemType } from '@meperdi/domain'

export interface PetDetailsJson {
  species: string
  breed?: string
  color?: string
  sex: 'female' | 'male' | 'unknown'
  ageText?: string
  temperament?: string
  urgentCare?: string
}

/** Nunca incluye "raza" ni especie — solo qué objeto es, marca, color y rasgo distintivo. */
export interface ObjectDetailsJson {
  whatIsIt: string
  brand?: string
  color?: string
  distinctiveTrait?: string
}

export interface LostReportJson {
  lostAt: string
  areaText: string
  circumstances?: string
  instructions?: string
}

export interface ContactJson {
  id: string
  label: string
  phoneE164: string
  channels: Array<'call' | 'whatsapp' | 'sms'>
  priority: number
  schedule?: string
  visiblePublicly: boolean
}

/**
 * Espejo real de `DbItem` (apps/web/src/mocks/db.ts) — subset mínimo para el Hito 1.
 * Id generado en la aplicación — ver nota en tag.entity.ts.
 */
@Entity('items')
export class Item {
  @PrimaryColumn('uuid')
  id!: string

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID()
  }

  @Column({ type: 'enum', enum: ITEM_TYPES })
  type!: ItemType

  @Column({ type: 'varchar', length: 40 })
  name!: string

  /** Foto de perfil — se muestra grande y en redondo (sección 7.4). */
  @Column({ type: 'varchar', nullable: true })
  photoUrl!: string | null

  @Column({ type: 'jsonb', default: () => "'[]'" })
  supportPhotoUrls!: string[]

  @Column({ type: 'varchar', length: 280, nullable: true })
  publicMessage!: string | null

  @Column({ type: 'jsonb', nullable: true })
  petDetails!: PetDetailsJson | null

  @Column({ type: 'jsonb', nullable: true })
  objectDetails!: ObjectDetailsJson | null

  @Column({ type: 'jsonb', default: () => "'[]'" })
  contacts!: ContactJson[]

  @Column({ type: 'jsonb', nullable: true })
  lostReport!: LostReportJson | null
}
