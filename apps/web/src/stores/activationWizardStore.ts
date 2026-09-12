import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ItemType } from '@meperdi/domain'

export interface ActivationContact {
  id: string
  label: string
  phoneE164: string
  channels: Array<'call' | 'whatsapp' | 'sms'>
  visiblePublicly: boolean
}

export interface ActivationDraft {
  publicSlug: string
  pinVerified: boolean
  itemId: string | null
  itemType: ItemType | null
  name: string
  /** Foto de perfil — se muestra grande y en redondo. */
  pendingPhotoUrl?: string
  /** Fotos de apoyo, agregadas de una en una. */
  pendingSupportPhotoUrls: string[]
  petSpecies?: string
  petBreed?: string
  petColor?: string
  petSex?: 'female' | 'male' | 'unknown'
  petAgeText?: string
  objectWhatIsIt?: string
  objectBrand?: string
  objectColor?: string
  objectDistinctiveTrait?: string
  careNotes?: string
  contacts: ActivationContact[]
  publicMessage: string
  consentAccepted: boolean
}

interface ActivationWizardState {
  drafts: Record<string, ActivationDraft>
  updateDraft: (slug: string, patch: Partial<ActivationDraft>) => void
  clearDraft: (slug: string) => void
}

/**
 * Deliberadamente NO expuesto como selector de Zustand: un selector que devuelve un objeto
 * nuevo en cada llamada (cuando todavía no hay borrador) rompe la comparación por referencia
 * de Zustand y provoca un loop de renders infinito. Se usa solo en el componente, después de
 * leer `drafts[slug]` con un selector estable.
 */
export function emptyDraft(publicSlug: string): ActivationDraft {
  return {
    publicSlug,
    pinVerified: false,
    itemId: null,
    itemType: null,
    name: '',
    pendingSupportPhotoUrls: [],
    contacts: [],
    publicMessage: '',
    consentAccepted: false,
  }
}

/**
 * Borrador de activación, respaldado por localStorage para que el asistente
 * "sobreviva recarga, retroceso y callback OAuth" — criterios de aceptación, sección 20.
 */
export const useActivationWizardStore = create<ActivationWizardState>()(
  persist(
    (set) => ({
      drafts: {},
      updateDraft: (slug, patch) =>
        set((state) => ({
          drafts: { ...state.drafts, [slug]: { ...(state.drafts[slug] ?? emptyDraft(slug)), ...patch } },
        })),
      clearDraft: (slug) =>
        set((state) => {
          const next = { ...state.drafts }
          delete next[slug]
          return { drafts: next }
        }),
    }),
    { name: 'meperdi.activation-draft' },
  ),
)
