import bcrypt from 'bcryptjs'
import type { DataSource } from 'typeorm'
import { Item } from '../items/item.entity'
import { Tag } from '../tags/tag.entity'

/**
 * Semillas mínimas del Hito 1 — solo para probar GET /api/public/tags/:slug de punta a
 * punta. Idempotente a propósito: puede llamarse más de una vez (por ejemplo desde
 * `/api/setup/run`, que un cPanel sin terminal puede necesitar visitar más de una vez)
 * sin crear tags duplicados.
 */
export async function runSeed(dataSource: DataSource): Promise<string[]> {
  const itemRepo = dataSource.getRepository(Item)
  const tagRepo = dataSource.getRepository(Tag)
  const messages: string[] = []

  const existingLuna = await tagRepo.findOne({ where: { publicSlug: 'activa-luna' } })
  if (existingLuna) {
    messages.push('activa-luna ya existía, no se tocó')
  } else {
    const luna = await itemRepo.save(
      itemRepo.create({
        type: 'pet',
        name: 'Luna',
        photoUrl: null,
        supportPhotoUrls: [],
        publicMessage: '¡Gracias por escanearme! Si me ves suelta, avísale a mi familia.',
        petDetails: {
          species: 'Perra',
          breed: 'Mestiza',
          color: 'Café y blanco',
          sex: 'female',
          ageText: '3 años aprox.',
          temperament: 'Juguetona, un poco tímida con desconocidos',
        },
        objectDetails: null,
        contacts: [
          {
            id: 'c-luna-1',
            label: 'Cami (dueña)',
            phoneE164: '+59170111222',
            channels: ['whatsapp', 'call'],
            priority: 1,
            schedule: '7:00–22:00',
            visiblePublicly: true,
          },
        ],
        lostReport: null,
      }),
    )
    await tagRepo.save(
      tagRepo.create({
        publicSlug: 'activa-luna',
        status: 'ACTIVE',
        activationPinHash: await bcrypt.hash('482913', 10),
        itemId: luna.id,
      }),
    )
    messages.push('activa-luna creado (ACTIVE)')
  }

  const existingUnclaimed = await tagRepo.findOne({ where: { publicSlug: 'sin-activar-001' } })
  if (existingUnclaimed) {
    messages.push('sin-activar-001 ya existía, no se tocó')
  } else {
    await tagRepo.save(
      tagRepo.create({
        publicSlug: 'sin-activar-001',
        status: 'UNCLAIMED',
        activationPinHash: await bcrypt.hash('246810', 10),
        itemId: null,
      }),
    )
    messages.push('sin-activar-001 creado (UNCLAIMED)')
  }

  return messages
}
