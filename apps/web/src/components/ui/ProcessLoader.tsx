import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { Chip } from './Chip'
import { Button } from './Button'
import { cn } from '../../lib/cn'

export type ProcessLoaderStatus = 'loading' | 'success' | 'error'

export interface ProcessLoaderProps {
  status: ProcessLoaderStatus
  /** Qué está haciendo la app ahora mismo, en lenguaje de usuario — no el nombre de una tecnología. */
  title: string
  /** Por qué está pasando, en una frase corta. Debe describir la operación real en curso. */
  description: string
  /** Detalle adicional para el estado de éxito (ej. enlace al explorer) — opcional. */
  successDetail?: ReactNode
  /** Mensaje de error humano, sin stack traces. Solo se usa cuando status es 'error'. */
  errorMessage?: string
  /** Red/tecnología real detrás de la operación en curso. Secundario: solo aparece cuando aplica. */
  networkBadge?: string
  onDismiss?: () => void
}

/**
 * Loader contextual reutilizable: comunica qué operación real está en curso en cada momento,
 * no qué tecnología existe en el proyecto. El badge de red es un dato secundario, nunca el foco.
 */
export function ProcessLoader({
  status,
  title,
  description,
  successDetail,
  errorMessage,
  networkBadge,
  onDismiss,
}: ProcessLoaderProps) {
  return (
    <div
      className="fixed inset-0 z-[150] flex items-center justify-center bg-night/50 px-5 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-label={title}
    >
      <div className="w-full max-w-sm rounded-card bg-white p-6 text-center shadow-card">
        <div
          className={cn(
            'mx-auto flex h-14 w-14 items-center justify-center rounded-pill',
            status === 'loading' && 'bg-violet/10 text-violet',
            status === 'success' && 'bg-aqua/15 text-[#0b6b58]',
            status === 'error' && 'bg-danger/10 text-danger',
          )}
        >
          {status === 'loading' && <Loader2 size={26} className="animate-spin" aria-hidden="true" />}
          {status === 'success' && <CheckCircle2 size={26} aria-hidden="true" />}
          {status === 'error' && <AlertTriangle size={26} aria-hidden="true" />}
        </div>

        <h2 className="mt-4 text-[19px] font-extrabold text-ink">{title}</h2>
        <p className="mt-1 text-[15px] text-muted">
          {status === 'error' && errorMessage ? errorMessage : description}
        </p>

        {status === 'success' && successDetail}

        {networkBadge && (
          <div className="mt-4 flex justify-center">
            <Chip tone="violet">{networkBadge}</Chip>
          </div>
        )}

        {status === 'error' && onDismiss && (
          <Button variant="secondary" className="mt-5 w-full" onClick={onDismiss}>
            Cerrar
          </Button>
        )}
      </div>
    </div>
  )
}
