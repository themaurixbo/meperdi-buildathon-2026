import { Injectable } from '@nestjs/common'
import { ApiException } from '../common/api-exception'

interface GoogleProfile {
  sub: string
  email: string
  name: string
  picture?: string
}

/** Llamadas directas a los endpoints de Google — sin passport, para calzar con el
 * contrato JSON que ya espera el frontend (start devuelve una URL, no redirige él mismo). */
@Injectable()
export class GoogleOAuthService {
  private readonly clientId = process.env.GOOGLE_CLIENT_ID ?? ''
  private readonly clientSecret = process.env.GOOGLE_CLIENT_SECRET ?? ''
  private readonly redirectUri = process.env.GOOGLE_REDIRECT_URI ?? ''

  buildConsentUrl(state: string): string {
    if (!this.clientId || !this.redirectUri) {
      throw new ApiException('google_not_configured', 'Google login no está configurado en el servidor.', 500)
    }
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      access_type: 'online',
      prompt: 'select_account',
    })
    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  async exchangeCodeForProfile(code: string): Promise<GoogleProfile> {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: this.clientId,
        client_secret: this.clientSecret,
        redirect_uri: this.redirectUri,
        grant_type: 'authorization_code',
      }),
    })

    if (!tokenResponse.ok) {
      throw new ApiException('google_token_exchange_failed', 'No pudimos confirmar tu acceso con Google.', 400)
    }

    const tokens = (await tokenResponse.json()) as { access_token: string }

    const profileResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    })

    if (!profileResponse.ok) {
      throw new ApiException('google_profile_failed', 'No pudimos leer tu perfil de Google.', 400)
    }

    return (await profileResponse.json()) as GoogleProfile
  }
}
