import { createFileRoute } from '@tanstack/react-router'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { Switch } from '../../../components/ui/Switch'
import {
  useNotificationPrefsStore,
  type NotificationChannel,
  type NotificationEvent,
} from '../../../stores/notificationPrefsStore'

export const Route = createFileRoute('/app/profile/notifications')({
  component: NotificationsScreen,
})

const EVENT_LABEL: Record<NotificationEvent, string> = {
  finder_report: 'Alguien avisa que encontró mi tag',
  location_shared: 'Comparten una ubicación',
  return_case: 'Novedades de una devolución',
  reward_available: 'Premio disponible para reclamar',
}

const CHANNEL_LABEL: Record<NotificationChannel, string> = {
  push: 'Push',
  email: 'Correo',
  whatsapp: 'WhatsApp',
}

/** D10 — Notificaciones: push, email y WhatsApp por tipo de evento. */
function NotificationsScreen() {
  const prefs = useNotificationPrefsStore((s) => s.prefs)
  const toggle = useNotificationPrefsStore((s) => s.toggle)

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title="Notificaciones" />
      <p className="mb-4 text-[15px] text-muted">Elige cómo quieres enterarte de cada evento.</p>

      <div className="space-y-3">
        {(Object.keys(EVENT_LABEL) as NotificationEvent[]).map((event) => (
          <Card key={event}>
            <p className="mb-3 text-[15px] font-extrabold text-ink">{EVENT_LABEL[event]}</p>
            <div className="space-y-3">
              {(Object.keys(CHANNEL_LABEL) as NotificationChannel[]).map((channel) => (
                <div key={channel} className="flex items-center justify-between">
                  <span className="text-[15px] text-ink">{CHANNEL_LABEL[channel]}</span>
                  <Switch
                    checked={prefs[event][channel]}
                    onCheckedChange={() => toggle(event, channel)}
                    label={`${CHANNEL_LABEL[channel]} para ${EVENT_LABEL[event]}`}
                  />
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>

      <p className="mt-4 text-[13px] text-muted">
        WhatsApp transaccional depende del proveedor que se elija en Fase 1 (sección 23 de la especificación).
      </p>
    </Screen>
  )
}
