import 'reflect-metadata'
import cookieParser from 'cookie-parser'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { EnvelopeInterceptor } from './common/envelope.interceptor'
import { AllExceptionsFilter } from './common/all-exceptions.filter'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // www.meperdi.com y api.meperdi.com son subdominios del mismo dominio raíz — CORS
  // solo necesita permitir ese origen específico, con credenciales para la cookie de
  // sesión que llegará en el Hito 2 (auth).
  app.enableCors({
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
    credentials: true,
  })

  app.use(cookieParser())
  app.setGlobalPrefix('api')
  app.useGlobalInterceptors(new EnvelopeInterceptor())
  app.useGlobalFilters(new AllExceptionsFilter())

  const port = process.env.PORT ?? 3000
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`ME PERDÍ API escuchando en el puerto ${port}`)
}

bootstrap()
