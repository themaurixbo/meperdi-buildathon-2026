import { Link, useRouterState } from '@tanstack/react-router'
import { Bell, Home, QrCode, Tag, User } from 'lucide-react'
import { cn } from '../../lib/cn'

const ITEMS = [
  { to: '/app', label: 'Inicio', icon: Home },
  { to: '/app/items', label: 'Mis tags', icon: Tag },
  { to: '/app/reports', label: 'Avisos', icon: Bell },
  { to: '/app/profile', label: 'Perfil', icon: User },
] as const

/** Navegación inferior móvil — sección 6.3: Inicio · Mis tags · Avisos · Perfil, con Escanear flotante. */
export function BottomNav() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })

  return (
    <nav
      aria-label="Navegación principal"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-night/10 bg-white/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="relative mx-auto flex max-w-md items-center justify-between px-4 py-2">
        {ITEMS.slice(0, 2).map((item) => (
          <NavLink key={item.to} {...item} active={pathname.startsWith(item.to) && (item.to !== '/app' || pathname === '/app')} />
        ))}

        <Link
          to="/scan"
          aria-label="Escanear un tag"
          className="absolute left-1/2 top-[-22px] flex h-14 w-14 -translate-x-1/2 items-center justify-center rounded-full bg-violet text-white shadow-[0_10px_30px_-10px_rgba(124,58,237,0.6)]"
        >
          <QrCode size={26} aria-hidden="true" />
        </Link>
        <span className="w-14" aria-hidden="true" />

        {ITEMS.slice(2).map((item) => (
          <NavLink key={item.to} {...item} active={pathname.startsWith(item.to)} />
        ))}
      </div>
    </nav>
  )
}

function NavLink({
  to,
  label,
  icon: Icon,
  active,
}: {
  to: string
  label: string
  icon: typeof Home
  active: boolean
}) {
  return (
    <Link
      to={to}
      className={cn(
        'flex min-w-[54px] flex-col items-center gap-1 rounded-field px-2 py-1.5 text-[11px] font-bold',
        active ? 'text-violet' : 'text-muted',
      )}
      aria-current={active ? 'page' : undefined}
    >
      <Icon size={24} aria-hidden="true" />
      {label}
    </Link>
  )
}
