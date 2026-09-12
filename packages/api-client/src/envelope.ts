/** Sobre de respuesta obligatorio para toda la API — sección 12. */
export interface ApiEnvelope<T> {
  data: T | null
  error: ApiError | null
  meta: Record<string, unknown> | null
  requestId: string
}

export interface ApiError {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

export class ApiRequestError extends Error {
  readonly code: string
  readonly fieldErrors?: Record<string, string>
  readonly requestId: string

  constructor(error: ApiError, requestId: string) {
    super(error.message)
    this.name = 'ApiRequestError'
    this.code = error.code
    this.fieldErrors = error.fieldErrors
    this.requestId = requestId
  }
}
