import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Apple, Camera, Mail } from 'lucide-react'
import { startOAuth, type OAuthProvider } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../components/ui/Screen'
import { Button } from '../../components/ui/Button'
import { featureFlags } from '../../lib/featureFlags'
import { useAppProgressStore } from '../../stores/appProgressStore'

type AuthSearch = { redirectTo?: string }

export const Route = createFileRoute('/auth/')({
  component: LoginScreen,
  validateSearch: (search: Record<string, unknown>): AuthSearch => ({
    redirectTo: typeof search.redirectTo === 'string' ? search.redirectTo : undefined,
  }),
})

const PROVIDERS: Array<{ id: OAuthProvider; label: string; enabled: boolean; icon?: typeof Apple }> = [
  { id: 'google', label: 'Continuar con Google', enabled: true },
  { id: 'facebook', label: 'Continuar con Facebook', enabled: true },
  { id: 'apple', label: 'Continuar con iCloud', enabled: true, icon: Apple },
  { id: 'instagram', label: 'Continuar con Instagram', enabled: featureFlags.instagramLogin, icon: Camera },
  { id: 'tiktok', label: 'Continuar con TikTok', enabled: featureFlags.tiktokLogin },
]

/** A07 — Login: proveedores sociales + correo, modo oscuro visual, sin nombrar "Gmail". */
function LoginScreen() {
  const { redirectTo } = Route.useSearch()
  const hasActivatedTag = useAppProgressStore((s) => s.hasActivatedTag)

  const startMutation = useMutation({
    mutationFn: (provider: OAuthProvider) => startOAuth(provider, redirectTo ?? '/app'),
    onSuccess: (result) => {
      window.location.assign(result.redirectUrl)
    },
  })

  return (
    <div className="min-h-svh bg-night text-cream">
      <Screen>
        <ScreenHeader showBack title="" trailing={<span className="w-12" />} />

        <div className="mb-8 flex justify-center">
          <div className="h-36 w-36 overflow-hidden rounded-full shadow-[0_16px_40px_-10px_rgba(0,0,0,0.55)] ring-4 ring-cream/90">
            <img
              src={`${import.meta.env.BASE_URL}brand/me-perdi-logo.png`}
              alt="ME PERDÍ"
              className="h-full w-full object-cover"
              style={{ objectPosition: '50% 2%', transform: 'scale(2.25)' }}
            />
          </div>
        </div>

        {!hasActivatedTag && (
          <>
            <h1 className="mb-2 text-center text-[26px] font-extrabold leading-[32px]">Entra para activar tu tag</h1>
            <p className="mb-8 text-center text-[17px] text-cream/75">
              Usamos tu cuenta solo para vincular tus tags y avisos.
            </p>
          </>
        )}

        <div className={hasActivatedTag ? 'mt-2 flex flex-col gap-3' : 'flex flex-col gap-3'}>
          {PROVIDERS.filter((p) => p.enabled).map((provider) => (
            <Button
              key={provider.id}
              variant="secondary"
              className="w-full !border-cream/15 !bg-white !text-ink"
              loading={startMutation.isPending && startMutation.variables === provider.id}
              disabled={startMutation.isPending}
              onClick={() => startMutation.mutate(provider.id)}
            >
              {provider.icon && <provider.icon size={20} aria-hidden="true" />}
              {provider.label}
            </Button>
          ))}

          <Button asChild variant="ghost" className="w-full !text-cream">
            <Link to="/auth/email" search={{ redirectTo }}>
              <Mail size={20} aria-hidden="true" /> Continuar con correo
            </Link>
          </Button>
        </div>

        {startMutation.isError && (
          <p role="alert" className="mt-4 text-[15px] font-semibold text-coral">
            No pudimos iniciar sesión. Inténtalo de nuevo.
          </p>
        )}

        <p className="mt-10 text-center text-[13px] leading-[20px] text-cream/50">
          Al continuar aceptas los Términos y la Política de privacidad de ME PERDÍ. Si es tu primera vez, tu cuenta
          se crea automáticamente con lo que elijas arriba.
        </p>
      </Screen>
    </div>
  )
}
