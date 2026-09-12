import { HttpException } from '@nestjs/common'

export interface ApiExceptionBody {
  code: string
  message: string
  fieldErrors?: Record<string, string>
}

/**
 * Error con código estable para el cliente — mismo patrón que `fail()` en
 * apps/web/src/mocks/respond.ts, para que los mensajes de error del backend real
 * coincidan con lo que el frontend ya sabe interpretar.
 */
export class ApiException extends HttpException {
  constructor(code: string, message: string, status = 400, fieldErrors?: Record<string, string>) {
    super({ code, message, fieldErrors } satisfies ApiExceptionBody, status)
  }
}
