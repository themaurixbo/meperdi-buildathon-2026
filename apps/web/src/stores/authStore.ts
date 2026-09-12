import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthSession {
  userId: string
  displayName: string
}

interface AuthState {
  session: AuthSession | null
  setSession: (session: AuthSession) => void
  signOut: () => void
}

/**
 * Sesión mock del propietario — respaldada por localStorage para sobrevivir recargas
 * y el cruce por login social/OTP, tal como exige la sección 8.3 y los criterios de aceptación.
 * En Fase 1 esto se reemplaza por la cookie HttpOnly del backend real (sección 13.3).
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    { name: 'meperdi.auth' },
  ),
)
