import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AdminSession {
  displayName: string
  email: string
}

interface AdminAuthState {
  session: AdminSession | null
  setSession: (session: AdminSession) => void
  signOut: () => void
}

/** Sesión de administración — actor interno, distinto del propietario y del aliado (sección 5). */
export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      session: null,
      setSession: (session) => set({ session }),
      signOut: () => set({ session: null }),
    }),
    { name: 'meperdi.admin-auth' },
  ),
)
