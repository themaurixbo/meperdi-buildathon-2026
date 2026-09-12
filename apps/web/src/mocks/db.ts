import type { ContactChannel, ItemType, ReturnCaseStatus, RewardClaimStatus, RewardKind, TagStatus } from '@meperdi/domain'
import type { TagPublicProfile } from '@meperdi/api-client'
import { placeholderPhoto } from './placeholderPhoto'

export interface DbContact {
  id: string
  label: string
  phoneE164: string
  channels: ContactChannel[]
  priority: number
  schedule?: string
  visiblePublicly: boolean
}

export interface DbPetDetails {
  species: string
  breed?: string
  color?: string
  sex: 'female' | 'male' | 'unknown'
  ageText?: string
  temperament?: string
  urgentCare?: string
}

/** Datos de un objeto — simplificado: qué objeto es, marca, color, rasgo distintivo. */
export interface DbObjectDetails {
  whatIsIt: string
  brand?: string
  color?: string
  distinctiveTrait?: string
}

export interface DbLostReport {
  lostAt: string
  areaText: string
  circumstances?: string
  instructions?: string
}

export interface DbItem {
  id: string
  type: ItemType
  name: string
  /** Foto de perfil — se muestra grande y en redondo. */
  photoUrl: string | null
  /** Fotos de apoyo adicionales, agregadas de una en una. */
  supportPhotoUrls: string[]
  publicMessage: string | null
  petDetails?: DbPetDetails
  objectDetails?: DbObjectDetails
  contacts: DbContact[]
  lostReport: DbLostReport | null
}

export interface DbTag {
  id: string
  publicSlug: string
  status: TagStatus
  activationPin: string
  itemId: string | null
}

export interface DbFinderReport {
  id: string
  guestToken: string
  caseNumber: string
  tagId: string
  message?: string
  contactOptIn: boolean
  contactPhoneE164?: string
  locationShared: boolean
  /** Coordenadas + nota opcional cuando el marcador se movió del punto real detectado. */
  sharedLocation?: { lat: number; lng: number; accuracyM: number; note?: string }
  createdAt: string
}

export interface DbReturnCase {
  /** Sirve como id interno y como token público /return/:caseToken — simplificación del mock. */
  id: string
  itemId: string
  finderReportId?: string
  status: ReturnCaseStatus
  handoffCode: string | null
  claimToken: string | null
}

export interface DbRewardClaim {
  claimToken: string
  returnCaseId: string
  status: RewardClaimStatus
  rewardKind: RewardKind | null
}

/**
 * Historial de actividad del tag — sección 11, entidad `scans`, ampliada a pedido del
 * cliente: cada escaneo (tag ya registrado o nuevo) guarda fecha/hora, IP aproximada y
 * lo que el dispositivo expone sin pedir permisos. Un aviso o una ubicación compartida
 * quedan en la misma línea de tiempo.
 */
export interface DbActivityEvent {
  id: string
  tagId: string
  type:
    | 'scan'
    | 'finder_report'
    | 'location_shared'
    | 'activated'
    | 'lost_declared'
    | 'return_confirmed'
    | 'returned_home'
    | 'transferred'
    | 'deactivated'
    | 'deleted'
  occurredAt: string
  userAgent?: string
  language?: string
  timeZone?: string
  screen?: string
  referrer?: string
  ip?: string | null
  lat?: number
  lng?: number
  locationNote?: string
}

export interface DbTransfer {
  token: string
  itemId: string
  code: string
  recipientHint: string
  accepted: boolean
}

/** Canje confirmado por un aliado — sección 11, entidad `redemptions`. */
export interface DbRedemption {
  id: string
  code: string
  partnerLocationId: string
  redeemedAt: string
  status: 'settled' | 'pending'
}

/** Campaña de un aliado — sección 7.6 (P04). */
export interface DbCampaign {
  id: string
  partnerName: string
  benefit: string
  stock: number
  validUntil: string
  locations: string
  rules: string
}

/** AD02 — Lote de tags creado/importado por administración. */
export interface DbTagBatch {
  id: string
  label: string
  quantity: number
  publicSlugPrefix: string
  status: 'printing' | 'printed' | 'shipped'
  createdAt: string
}

/** AD03 — Cuenta de un propietario/finder gestionada por administración. */
export interface DbAdminUser {
  id: string
  displayName: string
  email: string
  linkedMethods: Array<'google' | 'apple' | 'email' | 'facebook' | 'instagram'>
  status: 'active' | 'suspended'
  itemsCount: number
  createdAt: string
}

/** AD04 — Foto o texto reportado para moderación. */
export interface DbModerationReport {
  id: string
  itemId: string
  itemName: string
  field: 'photo' | 'public_message'
  reason: string
  status: 'pending' | 'warned' | 'suspended' | 'dismissed'
  reportedAt: string
}

/** AD05 — Caso de administración: aviso, devolución o disputa con SLA. */
export interface DbAdminCase {
  id: string
  kind: 'finder_report' | 'return' | 'dispute'
  refId: string
  summary: string
  status: 'open' | 'in_review' | 'resolved'
  slaHoursLeft: number
  assignedTo: string | null
  createdAt: string
}

/** AD06 — Movimiento del fondo comunitario. */
export interface DbFundEntry {
  id: string
  kind: 'income' | 'reserve' | 'payout'
  amountBs: number
  description: string
  occurredAt: string
}

/** AD07 — Entrada del catálogo de premios de un aliado. */
export interface DbRewardCatalogEntry {
  id: string
  partnerName: string
  item: string
  inventory: number
  costBs: number
  segment: string
  validUntil: string
  priority: number
}

/** AD08 — Regla de recompensa (premio garantizado + dinámica opcional). */
export interface DbRewardRule {
  id: string
  name: string
  guaranteed: boolean
  dynamicEnabled: boolean
  capPerUser: number
  minAge: number
  countries: string[]
  antifraude: string
}

/** AD09 — Señal de riesgo o fraude detectada por el sistema. */
export interface DbRiskSignal {
  id: string
  type: 'scan_velocity' | 'duplicate_account' | 'geo_anomaly'
  description: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'blocked' | 'cleared'
  detectedAt: string
}

/** AD10 — Entrada de auditoría: actor, acción, objeto, antes/después y motivo. */
export interface DbAuditEntry {
  id: string
  actor: string
  action: string
  object: string
  before?: string
  after?: string
  reason: string
  ipSummary: string
  occurredAt: string
}

/** AD11 — Configuración global editable por administración. */
export interface DbAdminConfig {
  supportedCountries: string[]
  supportedLanguages: string[]
  oauthProviders: string[]
  featureFlags: Record<string, boolean>
  notificationChannels: string[]
}

interface MockDatabase {
  tags: Map<string, DbTag>
  tagsBySlug: Map<string, string>
  items: Map<string, DbItem>
  finderReports: Map<string, DbFinderReport>
  returnCases: Map<string, DbReturnCase>
  rewardClaims: Map<string, DbRewardClaim>
  activityEvents: DbActivityEvent[]
  transfers: Map<string, DbTransfer>
  redemptions: DbRedemption[]
  campaigns: DbCampaign[]
  tagBatches: DbTagBatch[]
  adminUsers: DbAdminUser[]
  moderationReports: DbModerationReport[]
  adminCases: DbAdminCase[]
  fundEntries: DbFundEntry[]
  rewardCatalog: DbRewardCatalogEntry[]
  rewardRules: DbRewardRule[]
  riskSignals: DbRiskSignal[]
  auditLog: DbAuditEntry[]
  adminConfig: DbAdminConfig
}

function seed(): MockDatabase {
  const items: DbItem[] = [
    {
      id: 'item-luna',
      type: 'pet',
      name: 'Luna',
      photoUrl: placeholderPhoto('luna'),
      supportPhotoUrls: [placeholderPhoto('luna-2'), placeholderPhoto('luna-3')],
      publicMessage: '¡Gracias por escanearme! Si me ves suelta, avísale a mi familia.',
      petDetails: {
        species: 'Perra',
        breed: 'Mestiza',
        color: 'Café y blanco',
        sex: 'female',
        ageText: '3 años aprox.',
        temperament: 'Juguetona, un poco tímida con desconocidos',
      },
      contacts: [
        { id: 'c-luna-1', label: 'Cami (dueña)', phoneE164: '+59170111222', channels: ['whatsapp', 'call'], priority: 1, schedule: '7:00–22:00', visiblePublicly: true },
        { id: 'c-luna-2', label: 'Vecina', phoneE164: '+59170333444', channels: ['call'], priority: 2, visiblePublicly: true },
      ],
      lostReport: null,
    },
    {
      id: 'item-nala',
      type: 'pet',
      name: 'Nala',
      photoUrl: placeholderPhoto('nala'),
      supportPhotoUrls: [placeholderPhoto('nala-2')],
      publicMessage: 'Soy Nala. ¿Me ayudas a volver a casa?',
      petDetails: {
        species: 'Gata',
        breed: 'Siamesa mestiza',
        color: 'Beige y gris',
        sex: 'female',
        ageText: '2 años aprox.',
        temperament: 'Asustadiza, no se deja cargar por desconocidos',
        urgentCare: 'Necesita medicación diaria para la tiroides',
      },
      contacts: [
        { id: 'c-nala-1', label: 'Diego (dueño)', phoneE164: '+59175222333', channels: ['whatsapp', 'call', 'sms'], priority: 1, schedule: 'Todo el día', visiblePublicly: true },
      ],
      lostReport: {
        lostAt: new Date(Date.now() - 1000 * 60 * 60 * 30).toISOString(),
        areaText: 'Zona Equipetrol, cerca del segundo anillo',
        circumstances: 'Se asustó con fuegos artificiales y saltó la reja.',
        instructions: 'No perseguirla de frente, se asusta. Mejor sentarse y llamarla por su nombre.',
      },
    },
    {
      id: 'item-max',
      type: 'pet',
      name: 'Max',
      photoUrl: placeholderPhoto('max'),
      supportPhotoUrls: [],
      publicMessage: 'Gracias por ayudarme a volver a casa.',
      petDetails: { species: 'Perro', breed: 'Labrador', color: 'Dorado', sex: 'male', ageText: '5 años' },
      contacts: [
        { id: 'c-max-1', label: 'Familia Rojas', phoneE164: '+59168222111', channels: ['whatsapp', 'call'], priority: 1, visiblePublicly: true },
      ],
      lostReport: {
        lostAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
        areaText: 'Barrio Las Palmas',
      },
    },
    {
      id: 'item-rocky',
      type: 'pet',
      name: 'Rocky',
      photoUrl: placeholderPhoto('rocky'),
      supportPhotoUrls: [],
      publicMessage: '¡Ya volví a casa gracias a la comunidad!',
      petDetails: { species: 'Perro', breed: 'Criollo', color: 'Negro', sex: 'male', ageText: '1 año' },
      contacts: [
        { id: 'c-rocky-1', label: 'Ana', phoneE164: '+59177888999', channels: ['whatsapp'], priority: 1, visiblePublicly: true },
      ],
      lostReport: null,
    },
    {
      id: 'item-joel-phone',
      type: 'object',
      name: 'Celular de Joel',
      photoUrl: placeholderPhoto('joel-phone'),
      supportPhotoUrls: [placeholderPhoto('joel-phone-2')],
      publicMessage: 'El celular está bloqueado. Si lo encontraste, contáctame por favor.',
      objectDetails: { whatIsIt: 'Celular', brand: 'Samsung Galaxy (gama media)', color: 'Negro', distinctiveTrait: 'Funda transparente con una calcomanía de estrella' },
      contacts: [
        { id: 'c-joel-1', label: 'Joel', phoneE164: '+59169555666', channels: ['whatsapp', 'call'], priority: 1, visiblePublicly: true },
      ],
      lostReport: null,
    },
    {
      id: 'item-vale-bag',
      type: 'object',
      name: 'Mochila de Vale',
      photoUrl: placeholderPhoto('vale-bag'),
      supportPhotoUrls: [],
      publicMessage: 'Tiene cosas de la universidad, ¡me sería de mucha ayuda recuperarla!',
      objectDetails: { whatIsIt: 'Mochila', brand: undefined, color: 'Azul marino', distinctiveTrait: 'Parche bordado de girasol en el bolsillo frontal' },
      contacts: [
        { id: 'c-vale-1', label: 'Vale', phoneE164: '+59176444555', channels: ['whatsapp'], priority: 1, visiblePublicly: true },
      ],
      lostReport: null,
    },
    {
      id: 'item-suspended-demo',
      type: 'pet',
      name: 'Firulais',
      photoUrl: placeholderPhoto('firulais'),
      supportPhotoUrls: [],
      publicMessage: null,
      petDetails: { species: 'Perro', color: 'Blanco', sex: 'unknown' },
      contacts: [],
      lostReport: null,
    },
    {
      id: 'item-long-name',
      type: 'pet',
      name: 'Chiquitín Segundo de las Flores del Sur',
      photoUrl: null,
      supportPhotoUrls: [],
      publicMessage: 'Caso de prueba: nombre largo y cinco contactos.',
      petDetails: { species: 'Perro', breed: 'Chihuahua', color: 'Café', sex: 'male', ageText: '7 años' },
      contacts: [
        { id: 'c-long-1', label: 'Contacto 1', phoneE164: '+59170000001', channels: ['call'], priority: 1, visiblePublicly: true },
        { id: 'c-long-2', label: 'Contacto 2', phoneE164: '+59170000002', channels: ['whatsapp'], priority: 2, visiblePublicly: true },
        { id: 'c-long-3', label: 'Contacto 3', phoneE164: '+59170000003', channels: ['sms'], priority: 3, visiblePublicly: true },
        { id: 'c-long-4', label: 'Contacto 4', phoneE164: '+59170000004', channels: ['call', 'whatsapp'], priority: 4, visiblePublicly: true },
        { id: 'c-long-5', label: 'Contacto 5', phoneE164: '+59170000005', channels: ['whatsapp', 'sms'], priority: 5, visiblePublicly: true },
      ],
      lostReport: null,
    },
  ]

  const tags: DbTag[] = [
    { id: 'tag-luna', publicSlug: 'activa-luna', status: 'ACTIVE', activationPin: '482913', itemId: 'item-luna' },
    { id: 'tag-nala', publicSlug: 'perdida-nala', status: 'LOST', activationPin: '552017', itemId: 'item-nala' },
    { id: 'tag-max', publicSlug: 'devolucion-max', status: 'RETURN_PENDING', activationPin: '119284', itemId: 'item-max' },
    { id: 'tag-rocky', publicSlug: 'en-casa-rocky', status: 'RETURNED', activationPin: '773310', itemId: 'item-rocky' },
    { id: 'tag-suspended', publicSlug: 'suspendido-demo', status: 'SUSPENDED', activationPin: '000000', itemId: 'item-suspended-demo' },
    { id: 'tag-deactivated', publicSlug: 'inactivo-demo', status: 'DEACTIVATED', activationPin: '111111', itemId: null },
    { id: 'tag-joel', publicSlug: 'activo-celular-joel', status: 'ACTIVE', activationPin: '335577', itemId: 'item-joel-phone' },
    { id: 'tag-vale', publicSlug: 'activo-mochila-vale', status: 'ACTIVE', activationPin: '998877', itemId: 'item-vale-bag' },
    { id: 'tag-long', publicSlug: 'nombre-largo-demo', status: 'ACTIVE', activationPin: '424242', itemId: 'item-long-name' },
    // Tags sin activar — para probar el registro de mascota/objeto con fotos desde cero.
    { id: 'tag-unclaimed-1', publicSlug: 'sin-activar-001', status: 'UNCLAIMED', activationPin: '246810', itemId: null },
    { id: 'tag-unclaimed-2', publicSlug: 'sin-activar-002', status: 'UNCLAIMED', activationPin: '135791', itemId: null },
    { id: 'tag-unclaimed-3', publicSlug: 'sin-activar-003', status: 'UNCLAIMED', activationPin: '975310', itemId: null },
    { id: 'tag-unclaimed-4', publicSlug: 'sin-activar-004', status: 'UNCLAIMED', activationPin: '864209', itemId: null },
  ]

  return {
    tags: new Map(tags.map((t) => [t.id, t])),
    tagsBySlug: new Map(tags.map((t) => [t.publicSlug, t.id])),
    items: new Map(items.map((i) => [i.id, i])),
    finderReports: new Map(),
    returnCases: new Map(),
    rewardClaims: new Map(),
    activityEvents: [],
    transfers: new Map(),
    redemptions: [],
    campaigns: [
      {
        id: 'campaign-vet-sur',
        partnerName: 'Veterinaria del Sur',
        benefit: '20% de descuento en consulta general',
        stock: 48,
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(),
        locations: 'Santa Cruz — Equipetrol, Urubó',
        rules: 'Un canje por mascota devuelta. No acumulable con otras promociones.',
      },
      {
        id: 'campaign-petshop-norte',
        partnerName: 'PetShop Norte',
        benefit: 'Kit de bienvenida (correa + snacks)',
        stock: 15,
        validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
        locations: 'Santa Cruz — Av. Banzer km 8',
        rules: 'Sujeto a disponibilidad de stock. Retiro en tienda con código de canje.',
      },
    ],
    tagBatches: [
      { id: 'batch-001', label: 'Lote lanzamiento Equipetrol', quantity: 200, publicSlugPrefix: 'mp-eq', status: 'shipped', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 40).toISOString() },
      { id: 'batch-002', label: 'Lote PetShop Norte', quantity: 500, publicSlugPrefix: 'mp-pn', status: 'printed', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
      { id: 'batch-003', label: 'Lote reposición Q3', quantity: 300, publicSlugPrefix: 'mp-q3', status: 'printing', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    adminUsers: [
      { id: 'user-cami', displayName: 'Cami Rodríguez', email: 'cami@example.com', linkedMethods: ['google'], status: 'active', itemsCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString() },
      { id: 'user-diego', displayName: 'Diego Flores', email: 'diego@example.com', linkedMethods: ['email'], status: 'active', itemsCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString() },
      { id: 'user-joel', displayName: 'Joel Ortiz', email: 'joel@example.com', linkedMethods: ['apple', 'email'], status: 'active', itemsCount: 1, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
      { id: 'user-spam', displayName: 'Cuenta reportada', email: 'sospechoso@example.com', linkedMethods: ['email'], status: 'suspended', itemsCount: 3, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    ],
    moderationReports: [
      { id: 'mod-1', itemId: 'item-max', itemName: 'Max', field: 'public_message', reason: 'Mensaje con datos de contacto fuera de lugar', status: 'pending', reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString() },
      { id: 'mod-2', itemId: 'item-suspended-demo', itemName: 'Firulais', field: 'photo', reason: 'Foto no corresponde a una mascota', status: 'suspended', reportedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    ],
    adminCases: [
      { id: 'case-1', kind: 'return', refId: 'tag-max', summary: 'Devolución de Max — coordinación de entrega', status: 'in_review', slaHoursLeft: 6, assignedTo: 'Soporte L1', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() },
      { id: 'case-2', kind: 'finder_report', refId: 'tag-nala', summary: 'Aviso de Nala en Equipetrol', status: 'open', slaHoursLeft: 18, assignedTo: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() },
      { id: 'case-3', kind: 'dispute', refId: 'redemption-demo', summary: 'Disputa por canje no reconocido en Veterinaria del Sur', status: 'open', slaHoursLeft: 40, assignedTo: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() },
    ],
    fundEntries: [
      { id: 'fund-1', kind: 'income', amountBs: 5000, description: 'Aporte patrocinador — lanzamiento Q3', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 20).toISOString() },
      { id: 'fund-2', kind: 'reserve', amountBs: -1200, description: 'Reserva para premios garantizados en curso', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
      { id: 'fund-3', kind: 'payout', amountBs: -350, description: 'Gift token canjeado — Veterinaria del Sur', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    rewardCatalog: [
      { id: 'catalog-1', partnerName: 'Veterinaria del Sur', item: '20% descuento en consulta', inventory: 48, costBs: 30, segment: 'Mascotas devueltas', validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 60).toISOString(), priority: 1 },
      { id: 'catalog-2', partnerName: 'PetShop Norte', item: 'Kit de bienvenida', inventory: 15, costBs: 45, segment: 'Mascotas devueltas', validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(), priority: 2 },
    ],
    rewardRules: [
      { id: 'rule-1', name: 'Premio garantizado — devolución', guaranteed: true, dynamicEnabled: false, capPerUser: 1, minAge: 18, countries: ['BO'], antifraude: 'Un premio por caso de devolución confirmado, requiere handoffCode válido.' },
      { id: 'rule-2', name: 'Dinámica opcional — ruleta', guaranteed: false, dynamicEnabled: false, capPerUser: 1, minAge: 18, countries: ['BO'], antifraude: 'Deshabilitada hasta validación legal por país.' },
    ],
    riskSignals: [
      { id: 'risk-1', type: 'scan_velocity', description: '14 escaneos del mismo tag en 3 minutos', severity: 'medium', status: 'open', detectedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
      { id: 'risk-2', type: 'duplicate_account', description: 'Dos cuentas con el mismo dispositivo reclamando el mismo premio', severity: 'high', status: 'open', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString() },
      { id: 'risk-3', type: 'geo_anomaly', description: 'Ubicación compartida a 400km del área del aviso', severity: 'low', status: 'cleared', detectedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
    auditLog: [
      { id: 'audit-1', actor: 'admin@meperdi.com', action: 'Suspender perfil', object: 'item-suspended-demo (Firulais)', before: 'ACTIVE', after: 'SUSPENDED', reason: 'Foto reportada no corresponde a una mascota', ipSummary: '190.10.xx.xx', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
      { id: 'audit-2', actor: 'admin@meperdi.com', action: 'Crear lote de tags', object: 'batch-003 (300 unidades)', reason: 'Reposición de stock Q3', ipSummary: '190.10.xx.xx', occurredAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    adminConfig: {
      supportedCountries: ['BO'],
      supportedLanguages: ['es'],
      oauthProviders: ['google', 'apple', 'facebook', 'instagram', 'email'],
      featureFlags: { instagramLogin: true, tiktokLogin: false, blockchainRewards: false, freeRewardDynamic: true },
      notificationChannels: ['push', 'email', 'sms'],
    },
  }
}

export const db = seed()

let caseCounter = 1000

export function nextCaseNumber(): string {
  caseCounter += 1
  return `MP-${caseCounter}`
}

export function randomToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

export function randomHandoffCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

export function logActivityEvent(event: Omit<DbActivityEvent, 'id' | 'occurredAt'>): void {
  db.activityEvents.push({ ...event, id: randomToken(), occurredAt: new Date().toISOString() })
}

export function findTagBySlug(publicSlug: string): DbTag | null {
  const id = db.tagsBySlug.get(publicSlug)
  if (!id) return null
  return db.tags.get(id) ?? null
}

/**
 * Perfil público — nunca incluye domicilio, apellidos, documentos, IMEI/serie ni datos
 * privados (sección 6, 9 y 10). SUSPENDED/DEACTIVATED/UNCLAIMED no exponen el item.
 */
export function toPublicProfile(tag: DbTag): TagPublicProfile {
  const item = tag.itemId ? db.items.get(tag.itemId) ?? null : null
  const exposeItem = item !== null && tag.status !== 'SUSPENDED' && tag.status !== 'DEACTIVATED' && tag.status !== 'UNCLAIMED'

  return {
    publicSlug: tag.publicSlug,
    tagStatus: tag.status,
    itemType: exposeItem ? item!.type : null,
    name: exposeItem ? item!.name : null,
    photoUrl: exposeItem ? item!.photoUrl : null,
    supportPhotoUrls: exposeItem ? item!.supportPhotoUrls : [],
    publicMessage: exposeItem ? item!.publicMessage : null,
    petDetails: exposeItem ? (item!.petDetails ?? null) : null,
    objectDetails: exposeItem ? (item!.objectDetails ?? null) : null,
    contacts: exposeItem
      ? item!.contacts
          .filter((c) => c.visiblePublicly)
          .sort((a, b) => a.priority - b.priority)
          .map((c) => ({ id: c.id, label: c.label, channels: c.channels, priority: c.priority, phoneE164: c.phoneE164, schedule: c.schedule }))
      : [],
    lostReport: exposeItem ? (item!.lostReport ?? null) : null,
  }
}
