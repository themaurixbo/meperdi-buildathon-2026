import { createFileRoute, Link, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { Gift, LayoutGrid, LogOut, Megaphone } from 'lucide-react'
import { usePartnerAuthStore } from '../stores/partnerAuthStore'

export const Route = createFileRoute('/partner')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/partner/login') return
    if (!usePartnerAuthStore.getState().session) {
      throw redirect({ to: '/partner/login' })
    }
  },
  component: PartnerLayout,
})

const NAV = [
  { to: '/partner', label: 'Validar', icon: Gift },
  { to: '/partner/redemptions', label: 'Redenciones', icon: LayoutGrid },
  { to: '/partner/campaigns', label: 'Campañas', icon: Megaphone },
]

/** Layout del portal de aliados (P01-P04) — actor distinto del propietario, sección 5. */
function PartnerLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = usePartnerAuthStore((s) => s.session)
  const signOut = usePartnerAuthStore((s) => s.signOut)

  if (location.pathname === '/partner/login') return <Outlet />

  return (
    <div className="min-h-svh bg-cream pb-24">
      <header className="border-b-2 border-night/10 bg-white px-5 py-4">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <div>
            <p className="text-[13px] font-semibold text-muted">Portal de aliados</p>
            <p className="text-[17px] font-extrabold text-ink">{session?.partnerName}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate({ to: '/partner/login' })
            }}
            aria-label="Cerrar sesión"
            className="flex h-11 w-11 items-center justify-center rounded-button bg-cream text-ink"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <Outlet />

      <nav className="fixed inset-x-0 bottom-0 border-t-2 border-night/10 bg-white px-3 py-2">
        <div className="mx-auto flex max-w-md items-center justify-around">
          {NAV.map((item) => {
            const active = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex flex-col items-center gap-1 rounded-button px-4 py-2 text-[13px] font-bold ${
                  active ? 'text-violet' : 'text-muted'
                }`}
              >
                <item.icon size={22} aria-hidden="true" />
                {item.label}
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
