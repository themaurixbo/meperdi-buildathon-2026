import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppProgressState {
  hasSeenOnboarding: boolean
  markOnboardingSeen: () => void
  hasActivatedTag: boolean
  markActivatedTag: () => void
}

/**
 * Progreso persistido del dispositivo: el onboarding (A03–A05) solo debe verse la
 * primera vez, y la pantalla de login deja de explicar "para qué sirve" una vez que
 * la persona ya activó un tag alguna vez.
 */
export const useAppProgressStore = create<AppProgressState>()(
  persist(
    (set) => ({
      hasSeenOnboarding: false,
      markOnboardingSeen: () => set({ hasSeenOnboarding: true }),
      hasActivatedTag: false,
      markActivatedTag: () => set({ hasActivatedTag: true }),
    }),
    { name: 'meperdi.app-progress' },
  ),
)
