import type { ComponentType } from 'react'
import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'

interface AdminPageHeaderProps {
  icon: ComponentType<{ size?: number; className?: string; 'aria-hidden'?: boolean }>
  title: string
  description: string
}

/** Encabezado compartido de las pantallas AD02-AD11: volver al dashboard + título + descripción. */
export function AdminPageHeader({ icon: Icon, title, description }: AdminPageHeaderProps) {
  return (
    <div className="mb-6">
      <Link
        to="/admin"
        className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-button bg-white shadow-card"
        aria-label="Volver al dashboard"
      >
        <ChevronLeft size={20} aria-hidden="true" />
      </Link>
      <div className="flex items-center gap-2.5">
        <Icon size={22} className="text-violet" aria-hidden={true} />
        <h1 className="text-[22px] font-extrabold text-ink">{title}</h1>
      </div>
      <p className="mt-1 text-[15px] text-muted">{description}</p>
    </div>
  )
}
