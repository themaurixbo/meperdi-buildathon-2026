/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_FLAG_TIKTOK_LOGIN?: string
  readonly VITE_FLAG_INSTAGRAM_LOGIN?: string
  readonly VITE_FLAG_BLOCKCHAIN_REWARDS?: string
  readonly VITE_FLAG_FREE_REWARD_DYNAMIC?: string
  readonly VITE_API_BASE_URL?: string
  readonly VITE_ENABLE_MOCKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
