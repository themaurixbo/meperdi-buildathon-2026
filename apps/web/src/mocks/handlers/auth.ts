import { http } from 'msw'
import { fail, ok } from '../respond'
import { randomToken } from '../db'

const mockUsers: Record<string, { userId: string; displayName: string }> = {
  google: { userId: 'user-google-demo', displayName: 'Camila R.' },
  facebook: { userId: 'user-facebook-demo', displayName: 'Diego M.' },
  tiktok: { userId: 'user-tiktok-demo', displayName: 'Vale S.' },
  instagram: { userId: 'user-instagram-demo', displayName: 'Joel T.' },
  apple: { userId: 'user-apple-demo', displayName: 'Ana P.' },
}

const otpByEmail = new Map<string, string>()

export const authHandlers = [
  http.post('/api/auth/:provider/start', async ({ params, request }) => {
    const provider = String(params.provider)
    const body = (await request.json().catch(() => ({}))) as { redirectTo?: string }
    const state = randomToken()
    const redirectTo = encodeURIComponent(body.redirectTo ?? '/app')
    return ok({
      redirectUrl: `/auth/callback/${provider}?state=${state}&code=mock-code&redirectTo=${redirectTo}`,
      state,
    })
  }),

  http.get('/api/auth/:provider/callback', async ({ params, request }) => {
    const provider = String(params.provider)
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    if (!code) return fail('missing_code', 'El proveedor no envió un código válido.', 400)

    const mock = mockUsers[provider]
    if (!mock) return fail('unsupported_provider', 'Este proveedor no está habilitado todavía.', 400)

    return ok({ userId: mock.userId, displayName: mock.displayName, isNewAccount: false })
  }),

  http.post('/api/auth/email/start', async ({ request }) => {
    const body = (await request.json()) as { email: string }
    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpByEmail.set(body.email, code)
    // eslint-disable-next-line no-console
    console.info(`[mock] Código OTP para ${body.email}: ${code}`)
    return ok({ sent: true as const })
  }),

  http.post('/api/auth/email/verify', async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string }
    const expected = otpByEmail.get(body.email)
    if (!expected || expected !== body.code) {
      return fail('invalid_code', 'El código no es válido o expiró.', 400, { code: 'Revisa el código de 6 dígitos.' })
    }
    return ok({ userId: `user-email-${randomToken().slice(0, 8)}`, displayName: body.email.split('@')[0]!, isNewAccount: true })
  }),
]
