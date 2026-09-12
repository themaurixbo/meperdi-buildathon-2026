import { apiRequest } from './http'
import type { OAuthCallbackResult, OAuthStartResult } from './types'

export type OAuthProvider = 'google' | 'facebook' | 'tiktok' | 'instagram' | 'apple'

export function startOAuth(provider: OAuthProvider, redirectTo?: string): Promise<OAuthStartResult> {
  return apiRequest<OAuthStartResult>(`/api/auth/${provider}/start`, {
    method: 'POST',
    body: { redirectTo },
  })
}

export function completeOAuthCallback(
  provider: OAuthProvider,
  params: { code: string; state: string },
): Promise<OAuthCallbackResult> {
  const query = new URLSearchParams(params).toString()
  return apiRequest<OAuthCallbackResult>(`/api/auth/${provider}/callback?${query}`)
}

export function requestEmailOtp(email: string): Promise<{ sent: true }> {
  return apiRequest<{ sent: true }>('/api/auth/email/start', { method: 'POST', body: { email } })
}

export function verifyEmailOtp(email: string, code: string): Promise<OAuthCallbackResult> {
  return apiRequest<OAuthCallbackResult>('/api/auth/email/verify', {
    method: 'POST',
    body: { email, code },
  })
}
