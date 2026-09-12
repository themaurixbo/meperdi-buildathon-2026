import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useAuthStore } from '../stores/authStore'
import { BottomNav } from '../components/ui/BottomNav'

export const Route = createFileRoute('/app')({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().session) {
      throw redirect({ to: '/auth', search: { redirectTo: location.pathname } })
    }
  },
  component: OwnerLayout,
})

/** Layout del propietario: navegación inferior fija — sección 6.3. */
function OwnerLayout() {
  return (
    <div className="min-h-svh bg-cream pb-24">
      <Outlet />
      <BottomNav />
    </div>
  )
}
