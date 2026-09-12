import type { ItemType } from '@meperdi/domain'
import { apiRequest, newIdempotencyKey } from './http'
import type {
  ActivationResult,
  ActivityEventSummary,
  ConfirmReturnResult,
  CreatedItemResult,
  HandoffCodeResult,
  LostReportCreatedResult,
  OwnerFinderReportDetail,
  OwnerFinderReportSummary,
  OwnerItemDetail,
  OwnerItemSummary,
  OwnerReturnCaseView,
  ReturnCaseResult,
} from './types'

export function listMyItems(): Promise<OwnerItemSummary[]> {
  return apiRequest<OwnerItemSummary[]>('/api/items')
}

export function getMyItem(itemId: string): Promise<OwnerItemDetail> {
  return apiRequest<OwnerItemDetail>(`/api/items/${itemId}`)
}

/** Historial de actividad del tag — botón "Ver historial de actividad" en D03. */
export function getTagActivity(itemId: string): Promise<ActivityEventSummary[]> {
  return apiRequest<ActivityEventSummary[]>(`/api/items/${itemId}/activity`)
}

/** D06 — "Ya volvió": el propietario confirma el regreso sin pasar por el flujo formal. */
export function markItemHome(itemId: string): Promise<{ tagStatus: string }> {
  return apiRequest<{ tagStatus: string }>(`/api/items/${itemId}/mark-home`, {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
  })
}

/** D12 — genera un código de transferencia para compartir con quien recibirá el tag. */
export function transferItem(itemId: string, recipientHint: string): Promise<{ transferToken: string; code: string }> {
  return apiRequest<{ transferToken: string; code: string }>(`/api/items/${itemId}/transfer`, {
    method: 'POST',
    body: { recipientHint },
    idempotencyKey: newIdempotencyKey(),
  })
}

/** D13 — desactivar (reversible). */
export function deactivateItem(itemId: string): Promise<{ tagStatus: string }> {
  return apiRequest<{ tagStatus: string }>(`/api/items/${itemId}/deactivate`, {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
  })
}

/** D13 — eliminar (libera el tag para volver a activarse). */
export function deleteItem(itemId: string): Promise<{ tagStatus: string }> {
  return apiRequest<{ tagStatus: string }>(`/api/items/${itemId}/delete`, {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
  })
}

export function listMyReports(): Promise<OwnerFinderReportSummary[]> {
  return apiRequest<OwnerFinderReportSummary[]>('/api/reports')
}

/** D08 — Detalle de aviso, con la ubicación que solo ve el propietario. */
export function getReportDetail(caseNumber: string): Promise<OwnerFinderReportDetail> {
  return apiRequest<OwnerFinderReportDetail>(`/api/reports/${caseNumber}`)
}

export function activateTag(publicSlug: string, pin: string): Promise<ActivationResult> {
  return apiRequest<ActivationResult>(`/api/tags/${publicSlug}/activate`, {
    method: 'POST',
    body: { pin },
    idempotencyKey: newIdempotencyKey(),
  })
}

export function createItem(body: {
  tagPublicSlug: string
  itemType: ItemType
  name: string
}): Promise<CreatedItemResult> {
  return apiRequest<CreatedItemResult>('/api/items', {
    method: 'POST',
    body,
    idempotencyKey: newIdempotencyKey(),
  })
}

export function patchItem(itemId: string, patch: Record<string, unknown>): Promise<{ updated: true }> {
  return apiRequest<{ updated: true }>(`/api/items/${itemId}`, { method: 'PATCH', body: patch })
}

export function createLostReport(
  itemId: string,
  body: { lostAt: string; areaText: string; circumstances?: string; instructions?: string },
): Promise<LostReportCreatedResult> {
  return apiRequest<LostReportCreatedResult>(`/api/items/${itemId}/lost-reports`, {
    method: 'POST',
    body,
    idempotencyKey: newIdempotencyKey(),
  })
}

export function createReturnCase(body: {
  itemId: string
  finderReportId?: string
}): Promise<ReturnCaseResult> {
  return apiRequest<ReturnCaseResult>('/api/return-cases', {
    method: 'POST',
    body,
    idempotencyKey: newIdempotencyKey(),
  })
}

export function getMyReturnCase(returnCaseId: string): Promise<OwnerReturnCaseView> {
  return apiRequest<OwnerReturnCaseView>(`/api/return-cases/${returnCaseId}`)
}

export function generateHandoffCode(returnCaseId: string): Promise<HandoffCodeResult> {
  return apiRequest<HandoffCodeResult>(`/api/return-cases/${returnCaseId}/handoff-code`, {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
  })
}

export function confirmReturnCase(returnCaseId: string): Promise<ConfirmReturnResult> {
  return apiRequest<ConfirmReturnResult>(`/api/return-cases/${returnCaseId}/confirm`, {
    method: 'POST',
    idempotencyKey: newIdempotencyKey(),
  })
}
