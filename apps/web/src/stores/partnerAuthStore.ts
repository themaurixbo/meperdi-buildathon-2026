import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface PartnerSession {
  partnerName: string
  email: string
}

interface PartnerAuthState {
  session: PartnerSession | null
  setSession: (session: PartnerSession) => void
  signOut: () => void
}

/** Sesión del aliado comercial — actor distinto del propietario (sección 5). */
export const usePartnerAuthStore = create<PartnerAuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    { name: 'meperdi.partner-auth' },
  ),
)
