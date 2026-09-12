import type { ItemType, ReturnCaseStatus, RewardClaimStatus, RewardKind, TagStatus } from '@meperdi/domain'

export interface PublicContact {
  id: string
  label: string
  channels: Array<'call' | 'whatsapp' | 'sms'>
  priority: number
  phoneE164: string
  schedule?: string
}

/** Vista del propietario — incluye contactos ocultos y su visibilidad (D09). */
export interface OwnerContact extends PublicContact {
  visiblePublicly: boolean
}

export interface PublicPetDetails {
  species: string
  breed?: string
  color?: string
  sex: 'female' | 'male' | 'unknown'
  ageText?: string
  temperament?: string
  urgentCare?: string
}

/** Datos de un objeto — simplificado: qué objeto es, marca, color, rasgo distintivo. */
export interface PublicObjectDetails {
  whatIsIt: string
  brand?: string
  color?: string
  distinctiveTrait?: string
}

export interface PublicLostReport {
  lostAt: string
  areaText: string
  circumstances?: string
  instructions?: string
}

/** Lo que devuelve GET /api/public/tags/:slug — nunca domicilio, apellidos, documentos ni ubicación del hogar. */
export interface TagPublicProfile {
  publicSlug: string
  tagStatus: TagStatus
  itemType: ItemType | null
  name: string | null
  /** Foto de perfil — se muestra lo más grande posible, en redondo (sección 7.4). */
  photoUrl: string | null
  /** Fotos adicionales de apoyo, mostradas debajo de la foto de perfil. */
  supportPhotoUrls: string[]
  publicMessage: string | null
  petDetails: PublicPetDetails | null
  objectDetails: PublicObjectDetails | null
  contacts: PublicContact[]
  lostReport: PublicLostReport | null
}

export interface ScanResult {
  tagStatus: TagStatus
}

export interface FinderReportResult {
  caseNumber: string
  guestToken: string
  status: 'received'
}

export interface LocationShareResult {
  accepted: true
}

export interface DeviceInfoInput {
  userAgent: string
  language: string
  timeZone: string
  screen: string
  referrer?: string
  ip?: string | null
}

/** Fila del historial de actividad del tag — extensión pendiente de confirmar, sección 11 (`scans`). */
export interface ActivityEventSummary {
  id: string
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
  deviceSummary: string | null
  ip: string | null
  lat?: number
  lng?: number
  locationNote?: string
}

export interface MessageSentResult {
  messageId: string
}

export interface OAuthStartResult {
  redirectUrl: string
  state: string
}

export interface OAuthCallbackResult {
  userId: string
  displayName: string
  isNewAccount: boolean
}

/** Solo valida el PIN y reserva la activación — el tag pasa a ACTIVE al crear el item (sección 8.1). */
export interface ActivationResult {
  tagStatus: TagStatus
  reserved: boolean
}

export interface CreatedItemResult {
  itemId: string
  publicSlug: string
}

/**
 * Resumen para el panel del propietario (D02). No está en la tabla de la sección 12:
 * es una extensión pendiente de confirmar para el contrato real de Fase 1
 * (`GET /api/items`, análogo a `POST /api/items`).
 */
export interface OwnerItemSummary {
  itemId: string
  publicSlug: string
  tagStatus: TagStatus
  itemType: ItemType
  name: string
  photoUrl: string | null
}

/** Detalle completo para D03/D04 — misma extensión pendiente de confirmar que `OwnerItemSummary`. */
export interface OwnerItemDetail extends OwnerItemSummary {
  supportPhotoUrls: string[]
  publicMessage: string | null
  petDetails: PublicPetDetails | null
  objectDetails: PublicObjectDetails | null
  contacts: OwnerContact[]
  lostReport: PublicLostReport | null
}

/** Extensión pendiente de confirmar: timeline de avisos del propietario (D07). */
export interface OwnerFinderReportSummary {
  caseNumber: string
  itemName: string
  publicSlug: string
  message: string | null
  locationShared: boolean
  createdAt: string
}

/** Detalle de un aviso — D08, con el mapa que solo ve el propietario. */
export interface OwnerFinderReportDetail extends OwnerFinderReportSummary {
  itemPhotoUrl: string | null
  contactOptIn: boolean
  contactPhoneE164?: string
  sharedLocation?: { lat: number; lng: number; accuracyM: number; note?: string }
}

export interface LostReportCreatedResult {
  lostReportId: string
  tagStatus: TagStatus
}

export interface ReturnCaseResult {
  returnCaseId: string
  /** Identifica el caso en la ruta pública /return/:caseToken — no está explícito en la sección 12. */
  caseToken: string
  status: ReturnCaseStatus
}

export interface PublicReturnCaseView {
  status: ReturnCaseStatus
  itemName: string
  itemPhotoUrl: string | null
}

export interface OwnerReturnCaseView {
  returnCaseId: string
  caseToken: string
  status: ReturnCaseStatus
  itemName: string
  handoffCode: string | null
  claimToken: string | null
}

export interface HandoffCodeResult {
  code: string
  expiresAt: string
}

export interface VerifyCodeResult {
  valid: boolean
}

export interface ConfirmReturnResult {
  status: ReturnCaseStatus
  claimToken: string
}

export interface RewardClaimResult {
  status: RewardClaimStatus
  rewardKind: RewardKind | null
}

export interface RedemptionValidationResult {
  valid: boolean
  partnerLocationId: string | null
  benefit?: string
  expiresAt?: string
}
