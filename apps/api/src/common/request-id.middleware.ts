import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'
import { Injectable, type NestMiddleware } from '@nestjs/common'

export interface RequestWithId extends Request {
  requestId: string
}

/** Un requestId por petición, compartido entre el interceptor de éxito y el filtro de error. */
@Injectable()
export class RequestIdMiddleware implements NestMiddleware {
  use(req: RequestWithId, _res: Response, next: NextFunction): void {
    req.requestId = randomUUID()
    next()
  }
}
