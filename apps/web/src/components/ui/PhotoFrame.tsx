import { ImageOff } from 'lucide-react'
import { cn } from '../../lib/cn'

export function PhotoFrame({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (!src) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-card bg-gradient-to-br from-violet/15 to-aqua/15 text-muted',
          className,
        )}
      >
        <ImageOff size={32} aria-hidden="true" />
        <span className="sr-only">Sin foto todavía</span>
      </div>
    )
  }

  return <img src={src} alt={alt} className={cn('rounded-card object-cover', className)} />
}
