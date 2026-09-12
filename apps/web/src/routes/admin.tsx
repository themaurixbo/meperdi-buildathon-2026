import { createFileRoute, Outlet, redirect, useLocation, useNavigate } from '@tanstack/react-router'
import { LogOut, ShieldCheck } from 'lucide-react'
import { useAdminAuthStore } from '../stores/adminAuthStore'

export const Route = createFileRoute('/admin')({
  beforeLoad: ({ location }) => {
    if (location.pathname === '/admin/login') return
    if (!useAdminAuthStore.getState().session) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

/** Layout del back-office de administración (AD01-AD11) — sección 7.6. */
function AdminLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const session = useAdminAuthStore((s) => s.session)
  const signOut = useAdminAuthStore((s) => s.signOut)

  if (location.pathname === '/admin/login') return <Outlet />

  return (
    <div className="min-h-svh bg-cream">
      <header className="border-b-2 border-night/10 bg-night px-5 py-4 text-cream">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={22} className="text-lime" aria-hidden="true" />
            <div>
              <p className="text-[13px] font-semibold text-cream/60">Administración ME PERDÍ</p>
              <p className="text-[17px] font-extrabold">{session?.displayName}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              signOut()
              navigate({ to: '/admin/login' })
            }}
            aria-label="Cerrar sesión"
            className="flex h-11 w-11 items-center justify-center rounded-button bg-cream/10 text-cream"
          >
            <LogOut size={20} aria-hidden="true" />
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-5 pb-16 pt-6">
        <Outlet />
      </div>
    </div>
  )
}
