require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { DataSource } = require('typeorm');
const bcrypt = require('bcryptjs');
const { randomUUID } = require('crypto');
const { Item } = require('./dist/items/item.entity');
const { Tag } = require('./dist/tags/tag.entity');

async function runSeed() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [Item, Tag],
    synchronize: false,
    logging: true,
    ssl: { rejectUnauthorized: false },
  });

  await dataSource.initialize();
  const itemRepo = dataSource.getRepository(Item);
  const tagRepo = dataSource.getRepository(Tag);

  // Clear existing demo data
  await tagRepo.delete({ publicSlug: 'firulais' });
  await tagRepo.delete({ publicSlug: 'lees-backpack' });
  await tagRepo.delete({ publicSlug: 'shomi-phone' });
  await itemRepo.delete({ name: 'Firulais' });
  await itemRepo.delete({ name: "Lee's Backpack" });
  await itemRepo.delete({ name: 'Shomi' });

  const genTagCode = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  // 1. FIRULAIS (Dog) -> Owner (parent)
  const firulais = await itemRepo.save({
    id: randomUUID(),
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
    contacts: [{
      id: 'c-firulais-1',
      label: 'Owner (Parent)',
      phoneE164: '+15551234567',
      channels: ['whatsapp', 'call'],
      priority: 1,
      schedule: '8:00-22:00',
      visiblePublicly: true,
    }],
    lostReport: null,
  });

  const firulaisPinHash = await bcrypt.hash('123456', 10);
  await tagRepo.save({
    id: randomUUID(),
    publicSlug: 'firulais',
    status: 'ACTIVE',
    activationPinHash: firulaisPinHash,
    itemId: firulais.id,
  });
  console.log('Firulais created (ACTIVE)');

  // 2. LEE'S BACKPACK -> Lee (child)
  const leesBackpack = await itemRepo.save({
    id: randomUUID(),
    type: 'object',
    name: "Lee's Backpack",
    photoUrl: null,
    supportPhotoUrls: [],
    publicMessage: "This backpack has my school stuff. Please help me get it back!",
    petDetails: null,
    objectDetails: {
      whatIsIt: 'Backpack',
      brand: 'Generic',
      color: 'Blue',
      distinctiveTrait: 'Star patch on front pocket',
    },
    contacts: [{
      id: 'c-backpack-1',
      label: 'Lee (Owner)',
      phoneE164: '+15551234568',
      channels: ['whatsapp', 'call'],
      priority: 1,
      schedule: 'After school',
      visiblePublicly: true,
    }],
    lostReport: null,
  });

  const backpackPinHash = await bcrypt.hash('123456', 10);
  await tagRepo.save({
    id: randomUUID(),
    publicSlug: 'lees-backpack',
    status: 'ACTIVE',
    activationPinHash: backpackPinHash,
    itemId: leesBackpack.id,
  });
  console.log("Lee's Backpack created (ACTIVE)");

  // 3. SHOMI PHONE -> Lee (child)
  const shomi = await itemRepo.save({
    id: randomUUID(),
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
    contacts: [{
      id: 'c-phone-1',
      label: 'Lee (Owner)',
      phoneE164: '+15551234568',
      channels: ['whatsapp', 'call'],
      priority: 1,
      schedule: 'After school',
      visiblePublicly: true,
    }],
    lostReport: null,
  });

  const shomiPinHash = await bcrypt.hash('123456', 10);
  await tagRepo.save({
    id: randomUUID(),
    publicSlug: 'shomi-phone',
    status: 'ACTIVE',
    activationPinHash: shomiPinHash,
    itemId: shomi.id,
  });
  console.log('Shomi phone created (ACTIVE)');

  console.log('Seed completed successfully');
  process.exit(0);
}

runSeed().catch(e => { console.error(e); process.exit(1); });