import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { ApiException } from '../common/api-exception'

interface LoginBody {
  password: string
}

interface LoginResponse {
  success: boolean
  token: string
}

@Controller('admin')
export class AdminController {
  constructor(private readonly config: ConfigService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: { password: string }): Promise<{ success: boolean; token: string }> {
    const expected = this.config.get<string>('ADMIN_PASSWORD')
    if (!expected) {
      throw new ApiException('not_configured', 'Admin password not configured on server', HttpStatus.INTERNAL_SERVER_ERROR)
    }
    if (body.password !== expected) {
      throw new ApiException('invalid_password', 'Invalid password', HttpStatus.UNAUTHORIZED)
    }

    // Simple token - in production use JWT or similar
    const token = Buffer.from(`admin:${Date.now()}`).toString('base64')
    return { success: true, token }
  }
}