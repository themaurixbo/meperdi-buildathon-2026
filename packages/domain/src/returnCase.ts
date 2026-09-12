/** Estado del caso de devolución — sección 7.5 (R03). */
export const RETURN_CASE_STATUSES = [
  'proposed',
  'accepted',
  'in_transit',
  'delivered',
  'cancelled',
  'disputed',
] as const

export type ReturnCaseStatus = (typeof RETURN_CASE_STATUSES)[number]

export const RETURN_CASE_STATUS_LABEL: Record<ReturnCaseStatus, string> = {
  proposed: 'Propuesta enviada',
  accepted: 'Aceptada',
  in_transit: 'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
  disputed: 'En disputa',
}

const RETURN_CASE_TRANSITIONS: Record<ReturnCaseStatus, readonly ReturnCaseStatus[]> = {
  proposed: ['accepted', 'cancelled'],
  accepted: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'disputed', 'cancelled'],
  delivered: ['disputed'],
  cancelled: [],
  disputed: ['cancelled', 'delivered'],
}

export function canTransitionReturnCase(from: ReturnCaseStatus, to: ReturnCaseStatus): boolean {
  return RETURN_CASE_TRANSITIONS[from].includes(to)
}

/** Un premio solo se emite una vez confirmada la entrega — sección 8.3 y regla de negocio de idempotencia (sección 9). */
export function canConfirmDelivery(status: ReturnCaseStatus): boolean {
  return status === 'in_transit'
}
