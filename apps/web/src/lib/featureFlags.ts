/**
 * Feature flags — sección 21, regla obligatoria 9: TikTok, Instagram, blockchain y la
 * dinámica de recompensa aleatoria deben poder activarse/desactivarse sin desplegar código.
 * En el prototipo (Fase 0) se leen de variables de entorno con defaults conservadores.
 */
export interface FeatureFlags {
  /** TikTok se habilita tras registro y revisión de la app — sección 7.1. */
  tiktokLogin: boolean
  /** Instagram queda reservado en diseño hasta confirmar el flujo vigente de Meta — sección 7.1. */
  instagramLogin: boolean
  /** Blockchain solo en Fase 3 — sección 13.4. */
  blockchainRewards: boolean
  /** Dinámica aleatoria gratuita, debe poder desactivarse por país — sección 9. */
  freeRewardDynamic: boolean
}

function readBooleanEnv(value: string | undefined, fallback: boolean): boolean {
  if (value === undefined) return fallback
  return value === 'true'
}

export const featureFlags: FeatureFlags = {
  tiktokLogin: readBooleanEnv(import.meta.env.VITE_FLAG_TIKTOK_LOGIN, false),
  // Activado por pedido directo del cliente para la demo — sigue siendo un flag
  // apagable sin desplegar código en cuanto se revise el flujo real de Meta.
  instagramLogin: readBooleanEnv(import.meta.env.VITE_FLAG_INSTAGRAM_LOGIN, true),
  blockchainRewards: readBooleanEnv(import.meta.env.VITE_FLAG_BLOCKCHAIN_REWARDS, false),
  freeRewardDynamic: readBooleanEnv(import.meta.env.VITE_FLAG_FREE_REWARD_DYNAMIC, true),
}
