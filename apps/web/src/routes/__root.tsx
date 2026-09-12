import { createRootRoute, Outlet } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { NotFoundScreen } from '../components/NotFoundScreen'
import { RouteErrorScreen } from '../components/RouteErrorScreen'

const DevScenarioPanel = import.meta.env.DEV
  ? lazy(() => import('../mocks/DevScenarioPanel').then((m) => ({ default: m.DevScenarioPanel })))
  : null

const TanStackRouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({ default: m.TanStackRouterDevtools })),
    )
  : null

export const Route = createRootRoute({
  component: RootComponent,
  notFoundComponent: NotFoundScreen,
  errorComponent: RouteErrorScreen,
})

function RootComponent() {
  return (
    <>
      <Outlet />
      {import.meta.env.DEV && DevScenarioPanel && TanStackRouterDevtools && (
        <Suspense fallback={null}>
          <DevScenarioPanel />
          <TanStackRouterDevtools position="bottom-left" />
        </Suspense>
      )}
    </>
  )
}
