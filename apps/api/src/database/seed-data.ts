import bcrypt from 'bcryptjs'
import type { DataSource } from 'typeorm'
import { Item } from '../items/item.entity'
import { Tag } from '../tags/tag.entity'

/**
 * Demo seed for admin panel + public app demo.
 * Creates two owners (parent + child Lee) with 3 active items:
 * - Firulais (dog) → parent
 * - Lee's Backpack → Lee
 * - Shomi phone → Lee
 * All tags are ACTIVE and associated.
 */
export async function runSeed(dataSource: DataSource): Promise<string[]> {
  const itemRepo = dataSource.getRepository(Item)
  const tagRepo = dataSource.getRepository(Tag)
  const messages: string[] = []

  // Clear existing demo data if any (idempotent)
  const demoSlugs = ['firulais', 'lees-backpack', 'shomi-phone']
  await tagRepo.delete({ publicSlug: demoSlugs[0] })
  await tagRepo.delete({ publicSlug: demoSlugs[1] })
  await tagRepo.delete({ publicSlug: demoSlugs[2] })
  await itemRepo.delete({ name: 'Firulais' })
  await itemRepo.delete({ name: "Lee's Backpack" })
  await itemRepo.delete({ name: 'Shomi' })

  // Helper: generate random 6-char alphanumeric tag code
  const genTagCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'
    let code = ''
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  // 1. FIRULAIS (Dog) → Owner (parent)
  const firulais = await itemRepo.save(
    itemRepo.create({
      type: 'pet',
      name: 'Firulais',
      photoUrl: null,
      supportPhotoUrls: [],
      publicMessage: 'Thank you for scanning me! If you see me loose, please let my family know.',
      petDetails: {
        species: 'Dog',
        breed: 'Mixed Breed',
        color: 'Brown and White',
        sex: 'male',
        ageText: '3 years approx.',
        temperament: 'Playful, a bit shy with strangers',
        urgentCare: null,
      },
      objectDetails: null,
      contacts: [
        {
          id: 'c-firulais-1',
          label: 'Owner (Parent)',
          phoneE164: '+15551234567',
          channels: ['whatsapp', 'call'],
          priority: 1,
          schedule: '8:00-22:00',
          visiblePublicly: true,
        },
      ],
      lostReport: null,
    }),
  )

  // Tag for Firulais
  const firulaisTagCode = genTagCode()
  await tagRepo.save(
    tagRepo.create({
      publicSlug: 'firulais',
      status: 'ACTIVE',
      activationPinHash: await bcrypt.hash('123456', 10),
      itemId: firulais.id,
    }),
  )
  messages.push(`Firulais created (ACTIVE) - tag: ${firulaisTagCode}`)

  // 2. LEE'S BACKPACK → Lee (child)
  const leesBackpack = await itemRepo.save(
    itemRepo.create({
      type: 'object',
      name: "Lee's Backpack",
      photoUrl: null,
      supportPhotoUrls: [],
      publicMessage: 'This backpack has my school stuff. Please help me get it back!',
      petDetails: null,
      objectDetails: {
        whatIsIt: 'Backpack',
        brand: 'Generic',
        color: 'Blue',
        distinctiveTrait: 'Star patch on front pocket',
      },
      contacts: [
        {
          id: 'c-backpack-1',
          label: 'Lee (Owner)',
          phoneE164: '+15551234568',
          channels: ['whatsapp', 'call'],
          priority: 1,
          schedule: 'After school',
          visiblePublicly: true,
        },
      ],
      lostReport: null,
    }),
  )

  // Tag for Lee's Backpack
  const backpackTagCode = genTagCode()
  await tagRepo.save(
    tagRepo.create({
      publicSlug: 'lees-backpack',
      status: 'ACTIVE',
      activationPinHash: await bcrypt.hash('123456', 10),
      itemId: leesBackpack.id,
    }),
  )
  messages.push(`Lee's Backpack created (ACTIVE) - tag: ${backpackTagCode}`)

  // 3. SHOMI PHONE → Lee (child)
  const shomi = await itemRepo.save(
    itemRepo.create({
      type: 'object',
      name: 'Shomi',
      photoUrl: null,
      supportPhotoUrls: [],
      publicMessage: 'This is my phone. It is locked. Please contact me if found.',
      petDetails: null,
      objectDetails: {
        whatIsIt: 'Smartphone',
        brand: 'Shomi',
        color: 'Black',
        distinctiveTrait: 'Clear case with star sticker',
      },
      contacts: [
        {
          id: 'c-phone-1',
          label: 'Lee (Owner)',
          phoneE164: '+15551234568',
          channels: ['whatsapp', 'call'],
          priority: 1,
          schedule: 'After school',
          visiblePublicly: true,
        },
      ],
      lostReport: null,
    }),
  )

  // Tag for Shomi
  const shomiTagCode = genTagCode()
  await tagRepo.save(
    tagRepo.create({
      publicSlug: 'shomi-phone',
      status: 'ACTIVE',
      activationPinHash: await bcrypt.hash('123456', 10),
      itemId: shomi.id,
    }),
  )
  messages.push(`Shomi phone created (ACTIVE) - tag: ${shomiTagCode}`)

  return messages
}