/**
 * Estado del tag — sección 1.1 de la especificación.
 * El QR SIEMPRE resuelve por este estado guardado, nunca por conteo de escaneos.
 */
export const TAG_STATUSES = [
  'UNCLAIMED',
  'ACTIVE',
  'LOST',
  'RETURN_PENDING',
  'RETURNED',
  'SUSPENDED',
  'DEACTIVATED',
] as const

export type TagStatus = (typeof TAG_STATUSES)[number]

/** Transiciones válidas por estado, derivadas de los flujos críticos (sección 8) y las reglas de negocio (sección 9). */
export const TAG_STATUS_TRANSITIONS: Record<TagStatus, readonly TagStatus[]> = {
  UNCLAIMED: ['ACTIVE'],
  ACTIVE: ['LOST', 'RETURN_PENDING', 'SUSPENDED', 'DEACTIVATED'],
  LOST: ['RETURN_PENDING', 'ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
  RETURN_PENDING: ['RETURNED', 'LOST', 'ACTIVE', 'SUSPENDED'],
  RETURNED: ['ACTIVE', 'SUSPENDED', 'DEACTIVATED'],
  SUSPENDED: ['ACTIVE', 'DEACTIVATED'],
  DEACTIVATED: ['ACTIVE'],
}

export function canTransitionTag(from: TagStatus, to: TagStatus): boolean {
  return TAG_STATUS_TRANSITIONS[from].includes(to)
}

/** Qué puede ver un visitante que escanea el QR en cada estado — tabla de la sección 1.1. */
export function isPubliclyViewableTagStatus(status: TagStatus): boolean {
  return status === 'ACTIVE' || status === 'LOST' || status === 'RETURN_PENDING' || status === 'RETURNED'
}

export function requiresActivation(status: TagStatus): boolean {
  return status === 'UNCLAIMED'
}

export function isNeutralSupportOnly(status: TagStatus): boolean {
  return status === 'SUSPENDED' || status === 'DEACTIVATED'
}
