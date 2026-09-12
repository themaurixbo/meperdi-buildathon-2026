import type { TagStatus } from '@meperdi/domain'
import { CheckCircle2, Home, HandHeart, MapPinOff, PauseCircle, ShieldAlert, Sparkles } from 'lucide-react'
import { Chip } from './Chip'

const CONFIG: Record<TagStatus, { label: string; tone: 'night' | 'violet' | 'aqua' | 'coral' | 'lime' | 'muted'; icon: typeof Home }> = {
  UNCLAIMED: { label: 'Sin activar', tone: 'muted', icon: Sparkles },
  ACTIVE: { label: 'En casa', tone: 'aqua', icon: Home },
  LOST: { label: 'ME PERDÍ', tone: 'coral', icon: MapPinOff },
  RETURN_PENDING: { label: 'Devolución coordinada', tone: 'violet', icon: HandHeart },
  RETURNED: { label: 'Volvió a casa', tone: 'lime', icon: CheckCircle2 },
  SUSPENDED: { label: 'En revisión', tone: 'muted', icon: ShieldAlert },
  DEACTIVATED: { label: 'Inactivo', tone: 'muted', icon: PauseCircle },
}

/** Estado siempre visible en icono + texto, nunca solo color — principio 6/7 de la especificación. */
export function TagStatusBadge({ status }: { status: TagStatus }) {
  const { label, tone, icon: Icon } = CONFIG[status]
  return (
    <Chip tone={tone} icon={<Icon size={16} strokeWidth={2.5} aria-hidden="true" />}>
      {label}
    </Chip>
  )
}
