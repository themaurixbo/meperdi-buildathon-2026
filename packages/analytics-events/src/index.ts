/**
 * Catálogo de analítica — sección 18 de la especificación.
 * Regla dura: nunca incluir nombres, teléfonos, mensajes, coordenadas ni fotos en los payloads.
 */
import type { TagStatus } from '@meperdi/domain'

export interface AnalyticsEventMap {
  tag_scanned: { tagStatus: TagStatus }
  activation_started: Record<string, never>
  activation_completed: Record<string, never>
  finder_action_selected: { action: 'location' | 'message' | 'call' | 'whatsapp' }
  finder_report_sent: Record<string, never>
  lost_report_created: Record<string, never>
  return_case_created: Record<string, never>
  return_case_confirmed: Record<string, never>
  reward_claimed: { rewardKind: 'guaranteed_gift_token' | 'free_dynamic' }
  reward_redeemed: Record<string, never>
  permission_denied: { permission: 'camera' | 'location' | 'notifications' }
}

export type AnalyticsEventName = keyof AnalyticsEventMap

export interface AnalyticsEvent<Name extends AnalyticsEventName = AnalyticsEventName> {
  name: Name
  payload: AnalyticsEventMap[Name]
  occurredAt: string
}

export function createAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  payload: AnalyticsEventMap[Name],
): AnalyticsEvent<Name> {
  return { name, payload, occurredAt: new Date().toISOString() }
}
