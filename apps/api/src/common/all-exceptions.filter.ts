import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import type { Response } from 'express'
import type { ApiExceptionBody } from './api-exception'
import type { RequestWithId } from './request-id.middleware'

const STATUS_CODE: Record<number, string> = {
  400: 'bad_request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  409: 'conflict',
  422: 'unprocessable_entity',
  429: 'too_many_requests',
}

function isApiExceptionBody(value: unknown): value is ApiExceptionBody {
  return typeof value === 'object' && value !== null && 'code' in value && 'message' in value
}

/**
 * Traduce cualquier excepción a `{ data: null, error: { code, message, fieldErrors } }`
 * — el mismo contrato de error que ya consume `ApiRequestError` en
 * `packages/api-client/src/http.ts` (sección 12).
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<RequestWithId>()

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR
    const exceptionResponse = exception instanceof HttpException ? exception.getResponse() : null

    let code = STATUS_CODE[status] ?? 'unknown_error'
    let message = 'Ocurrió un error inesperado.'
    let fieldErrors: Record<string, string> | undefined

    if (isApiExceptionBody(exceptionResponse)) {
      code = exceptionResponse.code
      message = exceptionResponse.message
      fieldErrors = exceptionResponse.fieldErrors
    } else if (exception instanceof HttpException) {
      message = exception.message
    }

    if (status >= 500) {
      this.logger.error(`[${request.requestId}] ${message}`, exception instanceof Error ? exception.stack : undefined)
    }

    response.status(status).json({
      data: null,
      error: { code, message, fieldErrors },
      meta: null,
      requestId: request.requestId,
    })
  }
}
