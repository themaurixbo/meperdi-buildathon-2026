import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { configureApiClient } from '@meperdi/api-client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/queryClient'
import { AppBoot } from './components/AppBoot'

// Vacío (mismo origen) hasta que exista el backend real — sección "cuando conectemos
// el backend real" del DEPLOY_CPANEL.md. Con VITE_ENABLE_MOCKS=false, MSW no intercepta
// nada y las peticiones van directo a esta URL.
configureApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' })

const router = createRouter({
  routeTree,
  // Sigue el "base" de Vite: '/' en la raíz del dominio, o el subpath de build
  // (ej. '/demo/') sin tener que tocar este archivo por deploy.
  basepath: import.meta.env.BASE_URL,
  defaultPreload: 'intent',
  scrollRestoration: true,
  context: { queryClient },
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

async function enableMocking(): Promise<void> {
  // La API real todavía no existe (Fase 0): MSW es el "backend" del prototipo,
  // así que corre también en producción hasta que exista un servidor de verdad.
  if (import.meta.env.VITE_ENABLE_MOCKS === 'false') return
  const { worker } = await import('./mocks/browser')
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

const mocksReady = enableMocking()
const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    <AppBoot ready={mocksReady}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
      </QueryClientProvider>
    </AppBoot>
  </StrictMode>,
)
