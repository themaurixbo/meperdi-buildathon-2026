import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { QrCode, ScanLine } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAppProgressStore } from '../stores/appProgressStore'
import { useAuthStore } from '../stores/authStore'

export const Route = createFileRoute('/')({
  component: LandingScreen,
})

/** A02 — Landing: promesa de marca + dos acciones, demostración visual del QR. */
function LandingScreen() {
  const navigate = useNavigate()
  const hasSeenOnboarding = useAppProgressStore((s) => s.hasSeenOnboarding)
  const session = useAuthStore((s) => s.session)

  function goActivate() {
    navigate(hasSeenOnboarding ? { to: '/start' } : { to: '/onboarding/$step', params: { step: '1' } })
  }

  function goEnter() {
    navigate(session ? { to: '/app' } : { to: '/auth', search: { redirectTo: '/app' } })
  }

  return (
    <div className="min-h-svh bg-night text-cream">
      <div className="campaign-gradient absolute inset-x-0 top-0 h-96 opacity-30" aria-hidden="true" />
      <div className="relative mx-auto flex min-h-svh w-full max-w-md flex-col px-6 pb-10 pt-12">
        <img src={`${import.meta.env.BASE_URL}brand/me-perdi-logo.png`} alt="ME PERDÍ" className="h-16 w-16 rounded-card object-contain" />

        <div className="mt-10 flex flex-1 flex-col justify-center gap-8">
          <div>
            <h1 className="text-[40px] font-extrabold leading-[44px]">Lo que se pierde, puede volver.</h1>
            <p className="mt-4 text-[17px] leading-[26px] text-cream/80">
              Un tag QR conecta a tu mascota u objeto con un perfil seguro. Quien lo encuentre puede avisarte en
              segundos, sin exponer tus datos.
            </p>
          </div>

          <div className="flex items-center justify-center gap-6 rounded-card bg-white/5 p-6" aria-hidden="true">
            <div className="flex h-24 w-24 items-center justify-center rounded-card border-2 border-dashed border-aqua/60">
              <ScanLine size={40} className="text-aqua" />
            </div>
            <div className="text-left text-[15px] text-cream/70">
              Escanea el Tag (Etiqueta) y conoce su estado al instante.
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button size="default" className="w-full" onClick={goActivate}>
              Activar mi tag
            </Button>
            <Button asChild variant="secondary" className="w-full !border-cream/20 !bg-white/5 !text-cream">
              <Link to="/scan">
                <QrCode size={20} aria-hidden="true" /> Escaneé un tag
              </Link>
            </Button>
            <button
              type="button"
              onClick={goEnter}
              className="mt-1 text-center text-[14px] font-bold uppercase tracking-wide text-cream/60"
            >
              Entrar
            </button>
          </div>
        </div>

        <Link to="/help" className="mt-8 text-center text-[15px] font-semibold text-cream/70 underline">
          ¿Cómo funciona ME PERDÍ?
        </Link>
      </div>
    </div>
  )
}
