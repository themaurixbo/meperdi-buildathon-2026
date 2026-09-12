import { Injectable, type CallHandler, type ExecutionContext, type NestInterceptor } from '@nestjs/common'
import type { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import type { RequestWithId } from './request-id.middleware'

export interface ApiEnvelope<T> {
  data: T
  error: null
  meta: Record<string, unknown> | null
  requestId: string
}

/**
 * Envuelve toda respuesta exitosa en `{ data, error: null, meta, requestId }` — el mismo
 * contrato que ya consume `packages/api-client/src/http.ts`, para que el frontend no
 * necesite ningún cambio de parsing al apagar los mocks (sección 12).
 */
@Injectable()
export class EnvelopeInterceptor<T> implements NestInterceptor<T, ApiEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<ApiEnvelope<T>> {
    const request = context.switchToHttp().getRequest<RequestWithId>()
    return next.handle().pipe(
      map((data) => ({
        data,
        error: null,
        meta: null,
        requestId: request.requestId,
      })),
    )
  }
}
