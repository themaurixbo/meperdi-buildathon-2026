import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '../../lib/cn'

type ChipTone = 'night' | 'violet' | 'aqua' | 'coral' | 'lime' | 'muted'

const TONE_CLASSES: Record<ChipTone, string> = {
  night: 'bg-night text-cream',
  violet: 'bg-violet/10 text-violet',
  aqua: 'bg-aqua/15 text-[#0b6b58]',
  coral: 'bg-coral/12 text-[#b0165a]',
  lime: 'bg-lime/25 text-[#4b5400]',
  muted: 'bg-night/5 text-muted',
}

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: ChipTone
  icon?: ReactNode
}

/** Chip con radio píldora — el color nunca es el único indicador, siempre va con icono y texto (sección 7). */
export function Chip({ className, tone = 'muted', icon, children, ...props }: ChipProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-[15px] font-bold leading-none',
        TONE_CLASSES[tone],
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </span>
  )
}
