import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { completeOAuthCallback, type OAuthProvider } from '@meperdi/api-client'
import { Screen } from '../../components/ui/Screen'
import { ErrorState } from '../../components/ui/StateViews'
import { useAuthStore } from '../../stores/authStore'
import { useEffect } from 'react'

type CallbackSearch = { code?: string; state?: string; redirectTo?: string }

export const Route = createFileRoute('/auth/callback/$provider')({
  component: OAuthCallbackScreen,
  validateSearch: (search: Record<string, unknown>): CallbackSearch => ({
    code: typeof search.code === 'string' ? search.code : undefined,
    state: typeof search.state === 'string' ? search.state : undefined,
    redirectTo: typeof search.redirectTo === 'string' ? search.redirectTo : undefined,
  }),
})

/** A09 — Callback social: carga, éxito, error, reintento. */
function OAuthCallbackScreen() {
  const { provider } = Route.useParams()
  const { code, state, redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const query = useQuery({
    queryKey: ['oauth-callback', provider, code, state],
    queryFn: () => completeOAuthCallback(provider as OAuthProvider, { code: code!, state: state! }),
    enabled: Boolean(code && state),
    retry: false,
  })

  useEffect(() => {
    if (query.data) {
      setSession({ userId: query.data.userId, displayName: query.data.displayName })
      navigate({ to: redirectTo ?? '/app', replace: true })
    }
  }, [query.data, navigate, redirectTo, setSession])

  return (
    <Screen className="flex min-h-svh flex-col items-center justify-center">
      {query.isError || !code || !state ? (
        <ErrorState
          title="No pudimos confirmar tu acceso"
          description="El proveedor no devolvió la información esperada. Vuelve a intentarlo."
          onRetry={() => navigate({ to: '/auth', search: { redirectTo } })}
        />
      ) : (
        <div className="flex flex-col items-center gap-4 text-center">
          <span
            className="h-10 w-10 animate-spin rounded-full border-4 border-violet border-t-transparent"
            aria-hidden="true"
          />
          <p className="text-[17px] font-semibold text-ink">Confirmando tu acceso…</p>
        </div>
      )}
    </Screen>
  )
}
