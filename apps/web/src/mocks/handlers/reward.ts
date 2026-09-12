import { http } from 'msw'
import type { RewardKind } from '@meperdi/domain'
import { fail, ok } from '../respond'
import { db } from '../db'

export const rewardHandlers = [
  http.post('/api/reward-claims/:token/claim', async ({ params, request }) => {
    const token = String(params.token)
    const claim = db.rewardClaims.get(token)
    if (!claim) return fail('claim_not_found', 'Este enlace de premio ya no es válido.', 404)

    // Idempotente: un mismo claimToken nunca emite dos premios (sección 9).
    if (claim.status === 'claimed' || claim.status === 'redeemed') {
      return ok({ status: claim.status, rewardKind: claim.rewardKind })
    }

    const body = (await request.json()) as { rewardKind: RewardKind }
    claim.status = 'claimed'
    claim.rewardKind = body.rewardKind
    return ok({ status: claim.status, rewardKind: claim.rewardKind })
  }),

  http.post('/api/redemptions/validate', async ({ request }) => {
    const body = (await request.json()) as { code: string }
    const valid = body.code.trim().length >= 6
    if (!valid) return ok({ valid: false, partnerLocationId: null })
    return ok({
      valid: true,
      partnerLocationId: 'partner-location-demo',
      benefit: '20% de descuento en consulta veterinaria',
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString(),
    })
  }),
]
