import type { ReactNode } from 'react'
import { AlertTriangle, Inbox, WifiOff } from 'lucide-react'
import { Button } from './Button'
import { cn } from '../../lib/cn'

/** Skeleton de carga — sección 17: cada pantalla con datos remotos debe tener estado `loading`. */
export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-field bg-night/8', className)} />
}

export function CardSkeleton() {
  return (
    <div className="rounded-card bg-white p-5 shadow-card">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-card" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      </div>
    </div>
  )
}

interface MessageStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

function MessageState({ icon, title, description, action }: MessageStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card bg-white/60 px-6 py-10 text-center">
      {icon}
      <p className="text-[22px] font-extrabold text-ink">{title}</p>
      {description && <p className="max-w-xs text-[17px] text-muted">{description}</p>}
      {action}
    </div>
  )
}

/** Estado `empty` — sección 17. */
export function EmptyState(props: MessageStateProps) {
  return <MessageState icon={<Inbox size={40} className="text-muted" aria-hidden="true" />} {...props} />
}

/** Estado `error` — con reintento claro, sección 15. */
export function ErrorState({ onRetry, ...props }: MessageStateProps & { onRetry?: () => void }) {
  return (
    <MessageState
      icon={<AlertTriangle size={40} className="text-danger" aria-hidden="true" />}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            Reintentar
          </Button>
        )
      }
      {...props}
    />
  )
}

/** Estado `offline` — sección 17. */
export function OfflineBanner() {
  return (
    <div
      role="status"
      className="flex items-center gap-2 rounded-field bg-night px-4 py-3 text-[15px] font-semibold text-cream"
    >
      <WifiOff size={18} aria-hidden="true" />
      Estás sin conexión. Algunos datos pueden no estar actualizados.
    </div>
  )
}
