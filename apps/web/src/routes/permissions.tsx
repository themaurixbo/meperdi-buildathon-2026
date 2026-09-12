import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Bell, Camera, MapPin } from 'lucide-react'
import { Screen } from '../components/ui/Screen'
import { Button } from '../components/ui/Button'
import { track } from '../lib/analytics'

type PermissionKind = 'camera' | 'location' | 'notifications'

type PermissionsSearch = { type: PermissionKind; next?: string }

export const Route = createFileRoute('/permissions')({
  component: PermissionsScreen,
  validateSearch: (search: Record<string, unknown>): PermissionsSearch => ({
    type: search.type === 'location' || search.type === 'notifications' ? search.type : 'camera',
    next: typeof search.next === 'string' ? search.next : undefined,
  }),
})

const COPY: Record<PermissionKind, { icon: typeof Camera; title: string; description: string }> = {
  camera: {
    icon: Camera,
    title: 'Necesitamos tu cámara',
    description: 'Solo para escanear el código QR del tag. No grabamos ni guardamos video.',
  },
  location: {
    icon: MapPin,
    title: 'Compartir tu ubicación',
    description: 'Solo se envía cuando tú lo decides, y únicamente el propietario podrá verla.',
  },
  notifications: {
    icon: Bell,
    title: 'Activar notificaciones',
    description: 'Te avisamos cuando alguien encuentre tu tag o haya novedades importantes.',
  },
}

/** A10 — Permisos: explicar cámara/notificaciones/ubicación, pedir cada permiso solo cuando se usa. */
function PermissionsScreen() {
  const { type, next } = Route.useSearch()
  const navigate = useNavigate()
  const { icon: Icon, title, description } = COPY[type]

  function grant() {
    navigate({ to: next ?? '/' })
  }

  function deny() {
    track('permission_denied', { permission: type })
    navigate({ to: next ?? '/' })
  }

  return (
    <Screen className="flex min-h-svh flex-col items-center justify-center text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-card bg-aqua/15">
        <Icon size={40} className="text-[#0b6b58]" aria-hidden="true" />
      </div>
      <h1 className="mb-3 text-[28px] font-extrabold text-ink">{title}</h1>
      <p className="mb-8 max-w-xs text-[17px] text-muted">{description}</p>

      <div className="flex w-full flex-col gap-3">
        <Button onClick={grant} className="w-full">
          Permitir
        </Button>
        <Button onClick={deny} variant="ghost" className="w-full">
          Ahora no
        </Button>
      </div>
    </Screen>
  )
}
