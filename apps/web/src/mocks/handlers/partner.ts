import { http } from 'msw'
import { fail, ok } from '../respond'
import { db, randomToken } from '../db'

const otpByEmail = new Map<string, string>()

/**
 * Extensión no listada en la sección 12: acceso, canje y campañas de aliados (P01-P04).
 * El backend real de Fase 1 deberá formalizar este contrato.
 */
export const partnerHandlers = [
  http.post('/api/partner/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) return fail('invalid_credentials', 'Revisa tu correo y contraseña.', 400)
    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpByEmail.set(body.email, code)
    // eslint-disable-next-line no-console
    console.info(`[mock] Código 2FA de aliado para ${body.email}: ${code}`)
    return ok({ sent: true as const })
  }),

  http.post('/api/partner/auth/verify-2fa', async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string }
    const expected = otpByEmail.get(body.email)
    if (!expected || expected !== body.code) {
      return fail('invalid_code', 'El código no es válido o expiró.', 400, { code: 'Revisa el código de 6 dígitos.' })
    }
    return ok({ partnerName: 'Veterinaria del Sur', email: body.email })
  }),

  http.post('/api/redemptions/confirm', async ({ request }) => {
    const body = (await request.json()) as { code: string; partnerLocationId: string }
    const redemption = {
      id: randomToken(),
      code: body.code,
      partnerLocationId: body.partnerLocationId,
      redeemedAt: new Date().toISOString(),
      status: 'settled' as const,
    }
    db.redemptions.push(redemption)
    return ok(redemption, { status: 201 })
  }),

  http.get('/api/partner/redemptions', async () => {
    const sorted = [...db.redemptions].sort((a, b) => b.redeemedAt.localeCompare(a.redeemedAt))
    return ok(sorted)
  }),

  http.get('/api/partner/campaigns', async () => {
    return ok(db.campaigns)
  }),

  http.post('/api/partner/campaigns', async ({ request }) => {
    const body = (await request.json()) as Omit<(typeof db.campaigns)[number], 'id'>
    const campaign = { id: randomToken(), ...body }
    db.campaigns.unshift(campaign)
    return ok(campaign, { status: 201 })
  }),
]
