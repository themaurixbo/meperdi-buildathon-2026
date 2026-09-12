import { ApiRequestError, type ApiEnvelope } from './envelope'

/**
 * Base URL configurable para cuando exista un backend real fuera del hosting estático de cPanel.
 * Vacío por defecto: las peticiones son same-origin y, en desarrollo, las intercepta MSW.
 */
let baseUrl = ''

export function configureApiClient(options: { baseUrl?: string }): void {
  baseUrl = options.baseUrl ?? ''
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  /** Las mutaciones críticas (sección 12) deben enviar Idempotency-Key. */
  idempotencyKey?: string
  signal?: AbortSignal
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'
  if (options.idempotencyKey) headers['Idempotency-Key'] = options.idempotencyKey

  const response = await fetch(`${baseUrl}${path}`, {
    method: options.method ?? 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    signal: options.signal,
    credentials: 'include',
  })

  const envelope = (await response.json()) as ApiEnvelope<T>

  if (!response.ok || envelope.error) {
    throw new ApiRequestError(
      envelope.error ?? { code: 'unknown_error', message: 'Ocurrió un error inesperado.' },
      envelope.requestId,
    )
  }

  return envelope.data as T
}

export function newIdempotencyKey(): string {
  return crypto.randomUUID()
}
