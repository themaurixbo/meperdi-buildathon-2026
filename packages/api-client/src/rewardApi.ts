import { apiRequest, newIdempotencyKey } from './http'
import type { RedemptionValidationResult, RewardClaimResult } from './types'
import type { RewardKind } from '@meperdi/domain'

export function claimReward(claimToken: string, rewardKind: RewardKind): Promise<RewardClaimResult> {
  return apiRequest<RewardClaimResult>(`/api/reward-claims/${claimToken}/claim`, {
    method: 'POST',
    body: { rewardKind },
    idempotencyKey: newIdempotencyKey(),
  })
}

export function validateRedemption(code: string): Promise<RedemptionValidationResult> {
  return apiRequest<RedemptionValidationResult>('/api/redemptions/validate', {
    method: 'POST',
    body: { code },
  })
}
