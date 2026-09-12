import { Body, Controller, Get, Param, Post, Query, Res } from '@nestjs/common'
import type { Response } from 'express'
import { AuthService } from './auth.service'
import { GoogleOAuthService } from './google-oauth.service'
import { ApiException } from '../common/api-exception'

interface StartBody {
  redirectTo?: string
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly google: GoogleOAuthService,
  ) {}

  @Post(':provider/start')
  start(@Param('provider') provider: string, @Body() body: StartBody): { redirectUrl: string; state: string } {
    if (provider !== 'google') {
      throw new ApiException('provider_not_available', `El acceso con ${provider} todavía no está disponible.`, 400)
    }
    const state = this.auth.createState(body.redirectTo)
    return { redirectUrl: this.google.buildConsentUrl(state), state }
  }

  @Get(':provider/callback')
  async callback(
    @Param('provider') provider: string,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<{ userId: string; displayName: string; isNewAccount: boolean }> {
    if (provider !== 'google') {
      throw new ApiException('provider_not_available', `El acceso con ${provider} todavía no está disponible.`, 400)
    }
    if (!code || !state) {
      throw new ApiException('missing_code', 'El proveedor no devolvió la información esperada.', 400)
    }

    this.auth.consumeState(state)
    const profile = await this.google.exchangeCodeForProfile(code)
    const { user, isNewAccount } = await this.auth.findOrCreateGoogleUser(profile)
    const token = this.auth.issueSessionToken(user)

    res.cookie('meperdi_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      domain: process.env.COOKIE_DOMAIN,
      maxAge: 30 * 24 * 60 * 60 * 1000,
    })

    return { userId: user.id, displayName: user.displayName, isNewAccount }
  }
}
