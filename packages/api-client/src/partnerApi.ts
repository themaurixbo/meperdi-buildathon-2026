import { apiRequest } from './http'

export interface PartnerRedemption {
  id: string
  code: string
  partnerLocationId: string
  redeemedAt: string
  status: 'settled' | 'pending'
}

export interface PartnerCampaign {
  id: string
  partnerName: string
  benefit: string
  stock: number
  validUntil: string
  locations: string
  rules: string
}

/** P01 — Acceso aliado con 2FA (extensión no listada en la sección 12). */
export function startPartnerLogin(email: string, password: string): Promise<{ sent: true }> {
  return apiRequest<{ sent: true }>('/api/partner/auth/login', { method: 'POST', body: { email, password } })
}

export function verifyPartnerLogin(email: string, code: string): Promise<{ partnerName: string; email: string }> {
  return apiRequest<{ partnerName: string; email: string }>('/api/partner/auth/verify-2fa', {
    method: 'POST',
    body: { email, code },
  })
}

/** P02 — Confirmar canje tras validar el código. */
export function confirmRedemption(code: string, partnerLocationId: string): Promise<PartnerRedemption> {
  return apiRequest<PartnerRedemption>('/api/redemptions/confirm', {
    method: 'POST',
    body: { code, partnerLocationId },
  })
}

/** P03 — Historial de redenciones del aliado. */
export function listPartnerRedemptions(): Promise<PartnerRedemption[]> {
  return apiRequest<PartnerRedemption[]>('/api/partner/redemptions')
}

/** P04 — Catálogo de campañas. */
export function listPartnerCampaigns(): Promise<PartnerCampaign[]> {
  return apiRequest<PartnerCampaign[]>('/api/partner/campaigns')
}

export function createPartnerCampaign(body: Omit<PartnerCampaign, 'id'>): Promise<PartnerCampaign> {
  return apiRequest<PartnerCampaign>('/api/partner/campaigns', { method: 'POST', body })
}
