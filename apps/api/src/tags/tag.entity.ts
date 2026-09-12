import { randomUUID } from 'node:crypto'
import { BeforeInsert, Column, Entity, Index, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm'
import { TAG_STATUSES, type TagStatus } from '@meperdi/domain'
import { Item } from '../items/item.entity'

/**
 * Espejo real de `DbTag` (apps/web/src/mocks/db.ts) — el QR siempre resuelve por
 * `status`, nunca por conteo de escaneos (sección 1.1 de la especificación).
 *
 * El id se genera en la aplicación (no con `DEFAULT gen_random_uuid()`) porque no
 * podemos asumir que el hosting tenga la extensión pgcrypto habilitada — en shared
 * hosting el usuario de la base casi nunca tiene permisos para instalar extensiones.
 */
@Entity('tags')
export class Tag {
  @PrimaryColumn('uuid')
  id!: string

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID()
  }

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 80 })
  publicSlug!: string

  @Column({ type: 'enum', enum: TAG_STATUSES, default: 'UNCLAIMED' })
  status!: TagStatus

  /** Nunca se guarda en texto plano — hash bcrypt del PIN impreso en el tag (sección 8.1). */
  @Column({ type: 'varchar' })
  activationPinHash!: string

  @Column({ type: 'uuid', nullable: true })
  itemId!: string | null

  @OneToOne(() => Item, { nullable: true })
  @JoinColumn({ name: 'itemId' })
  item?: Item | null
}
