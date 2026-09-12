import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface FinderReportRecord {
  guestToken: string
  caseNumber: string
}

interface FinderReportState {
  reportsBySlug: Record<string, FinderReportRecord>
  saveReport: (slug: string, record: FinderReportRecord) => void
  getReport: (slug: string) => FinderReportRecord | undefined
}

/**
 * F10 — Seguir como invitado: guarda el enlace/token del aviso en el dispositivo
 * para que el finder pueda añadir ubicación o mensaje después, sin crear cuenta.
 */
export const useFinderReportStore = create<FinderReportState>()(
  persist(
    (set, get) => ({
      reportsBySlug: {},
      saveReport: (slug, record) =>
        set((state) => ({ reportsBySlug: { ...state.reportsBySlug, [slug]: record } })),
      getReport: (slug) => get().reportsBySlug[slug],
    }),
    { name: 'meperdi.finder-reports' },
  ),
)
