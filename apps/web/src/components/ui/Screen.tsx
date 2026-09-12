import type { ReactNode } from 'react'
import { ChevronLeft } from 'lucide-react'
import { useRouter } from '@tanstack/react-router'
import { cn } from '../../lib/cn'

/** Contenedor de pantalla mobile-first: ancho máximo cómodo en escritorio, sin fondo blanco puro. */
export function Screen({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn('mx-auto min-h-svh w-full max-w-md px-5 pb-10 pt-6', className)}>{children}</div>
}

interface ScreenHeaderProps {
  title?: string
  onBack?: () => void
  showBack?: boolean
  trailing?: ReactNode
}

/** Encabezado con retroceso — una decisión principal por pantalla, título grande y corto (principios 2 y 3). */
export function ScreenHeader({ title, onBack, showBack = true, trailing }: ScreenHeaderProps) {
  const router = useRouter()
  const goBack = onBack ?? (() => router.history.back())

  return (
    <header className="mb-4 flex items-center justify-between gap-2">
      {showBack ? (
        <button
          type="button"
          onClick={goBack}
          aria-label="Volver"
          className="flex h-12 w-12 items-center justify-center rounded-button bg-white shadow-card"
        >
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
      ) : (
        <span />
      )}
      {title && <h1 className="flex-1 truncate text-center text-[22px] font-extrabold text-ink">{title}</h1>}
      {trailing ?? <span className="w-12" />}
    </header>
  )
}
