import { randomUUID } from 'node:crypto'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { JwtService } from '@nestjs/jwt'
import { Repository } from 'typeorm'
import { ApiException } from '../common/api-exception'
import { User } from '../users/user.entity'

interface PendingState {
  redirectTo?: string
  expiresAt: number
}

const STATE_TTL_MS = 10 * 60 * 1000

@Injectable()
export class AuthService {
  private readonly pendingStates = new Map<string, PendingState>()

  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly jwt: JwtService,
  ) {}

  createState(redirectTo?: string): string {
    const state = randomUUID()
    this.pendingStates.set(state, { redirectTo, expiresAt: Date.now() + STATE_TTL_MS })
    return state
  }

  consumeState(state: string): PendingState {
    const pending = this.pendingStates.get(state)
    this.pendingStates.delete(state)
    if (!pending || pending.expiresAt < Date.now()) {
      throw new ApiException('invalid_state', 'El acceso expiró o ya se usó, intenta de nuevo.', 400)
    }
    return pending
  }

  async findOrCreateGoogleUser(profile: { sub: string; email: string; name: string; picture?: string }): Promise<{
    user: User
    isNewAccount: boolean
  }> {
    const existing = await this.users.findOne({ where: { googleId: profile.sub } })
    if (existing) return { user: existing, isNewAccount: false }

    const byEmail = await this.users.findOne({ where: { email: profile.email } })
    if (byEmail) {
      byEmail.googleId = profile.sub
      await this.users.save(byEmail)
      return { user: byEmail, isNewAccount: false }
    }

    const created = await this.users.save(
      this.users.create({
        googleId: profile.sub,
        email: profile.email,
        displayName: profile.name,
        photoUrl: profile.picture ?? null,
      }),
    )
    return { user: created, isNewAccount: true }
  }

  issueSessionToken(user: User): string {
    return this.jwt.sign({ sub: user.id, email: user.email, displayName: user.displayName })
  }
}
