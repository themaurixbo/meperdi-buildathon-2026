/** Tipo de premio comunitario — secciones 1, 7.5 (R07) y 9. Nunca lo fija el propietario. */
export const REWARD_KINDS = ['guaranteed_gift_token', 'free_dynamic'] as const

export type RewardKind = (typeof REWARD_KINDS)[number]

export const REWARD_KIND_LABEL: Record<RewardKind, string> = {
  guaranteed_gift_token: 'Gift token garantizado',
  free_dynamic: 'Dinámica gratuita',
}

export const REWARD_CLAIM_STATUSES = ['pending', 'claimed', 'redeemed', 'expired', 'disputed'] as const
export type RewardClaimStatus = (typeof REWARD_CLAIM_STATUSES)[number]

/**
 * La dinámica gratuita solo se ofrece si está habilitada y el finder es mayor de edad;
 * el gift token garantizado siempre está disponible como alternativa — sección 9.
 */
export function availableRewardKinds(options: {
  freeDynamicEnabledInCountry: boolean
  claimantIsAdult: boolean
}): readonly RewardKind[] {
  const kinds: RewardKind[] = ['guaranteed_gift_token']
  if (options.freeDynamicEnabledInCountry && options.claimantIsAdult) {
    kinds.push('free_dynamic')
  }
  return kinds
}
