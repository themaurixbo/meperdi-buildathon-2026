import { randomUUID } from 'node:crypto'
import { BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm'

/** Cuenta real de un dueño/finder autenticado — llega vía Google por ahora. */
@Entity('users')
export class User {
  @PrimaryColumn('uuid')
  id!: string

  @BeforeInsert()
  assignId(): void {
    this.id ??= randomUUID()
  }

  @Column({ type: 'varchar', unique: true, nullable: true })
  googleId!: string | null

  @Column({ type: 'varchar', unique: true })
  email!: string

  @Column({ type: 'varchar' })
  displayName!: string

  @Column({ type: 'varchar', nullable: true })
  photoUrl!: string | null

  @CreateDateColumn()
  createdAt!: Date
}
