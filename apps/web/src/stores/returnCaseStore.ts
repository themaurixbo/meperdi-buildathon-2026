import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface ReturnCaseState {
  caseByItemId: Record<string, string>
  setCase: (itemId: string, returnCaseId: string) => void
}

/** Recuerda el caso de devolución activo por item, para sobrevivir recarga (sección 20). */
export const useReturnCaseStore = create<ReturnCaseState>()(
  persist(
    (set) => ({
      caseByItemId: {},
      setCase: (itemId, returnCaseId) =>
        set((state) => ({ caseByItemId: { ...state.caseByItemId, [itemId]: returnCaseId } })),
    }),
    { name: 'meperdi.return-cases' },
  ),
)
