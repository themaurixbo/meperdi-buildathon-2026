import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type NotificationChannel = 'push' | 'email' | 'whatsapp'
export type NotificationEvent = 'finder_report' | 'location_shared' | 'return_case' | 'reward_available'

type Prefs = Record<NotificationEvent, Record<NotificationChannel, boolean>>

interface NotificationPrefsState {
  prefs: Prefs
  toggle: (event: NotificationEvent, channel: NotificationChannel) => void
}

const defaultPrefs: Prefs = {
  finder_report: { push: true, email: true, whatsapp: false },
  location_shared: { push: true, email: false, whatsapp: false },
  return_case: { push: true, email: true, whatsapp: true },
  reward_available: { push: true, email: true, whatsapp: false },
}

/** D10 — Preferencias de notificación por canal y evento, guardadas en el dispositivo. */
export const useNotificationPrefsStore = create<NotificationPrefsState>()(
  persist(
    (set) => ({
      prefs: defaultPrefs,
      toggle: (event, channel) =>
        set((state) => ({
          prefs: {
            ...state.prefs,
            [event]: { ...state.prefs[event], [channel]: !state.prefs[event][channel] },
          },
        })),
    }),
    { name: 'meperdi.notification-prefs' },
  ),
)
