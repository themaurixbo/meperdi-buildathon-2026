import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { configureApiClient } from '@meperdi/api-client'
import './index.css'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/queryClient'
import { AppBoot } from './components/AppBoot'

// API base URL - defaults to same origin, can be overridden via VITE_API_BASE_URL
configureApiClient({ baseUrl: import.meta.env.VITE_API_BASE_URL ?? '' })

const router = createRouter({
  routeTree,
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

const rootElement = document.getElementById('root')!

createRoot(rootElement).render(
  <StrictMode>
    <AppBoot ready={Promise.resolve()}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />}
      </QueryClientProvider>
    </AppBoot>
  </StrictMode>,
)