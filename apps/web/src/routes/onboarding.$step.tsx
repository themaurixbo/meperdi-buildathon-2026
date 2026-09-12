import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { KeySquare, QrCode, Sparkles } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { useAppProgressStore } from '../stores/appProgressStore'

export const Route = createFileRoute('/onboarding/$step')({
  component: OnboardingScreen,
})

const STEPS = [
  {
    id: '1',
    icon: KeySquare,
    title: 'Un QR que habla por ti.',
    description: 'Colócalo en el collar de tu mascota o pégalo como sticker en tu celular, mochila o llaves.',
  },
  {
    id: '2',
    icon: QrCode,
    title: 'Escanea. Avisa. Devuelve.',
    description: 'Quien encuentra tu tag ve un perfil seguro y puede avisarte al instante, sin crear una cuenta.',
  },
  {
    id: '3',
    icon: Sparkles,
    title: 'La comunidad agradece tu ayuda.',
    description: 'Cada devolución libera un premio comunitario para quien ayudó. No es dinero prometido por ti.',
  },
] as const

/** A03–A05 — Onboarding en tres tarjetas, con salida a "Elegir acción" (A06). */
function OnboardingScreen() {
  const { step } = Route.useParams()
  const navigate = useNavigate()
  const markOnboardingSeen = useAppProgressStore((s) => s.markOnboardingSeen)
  const index = STEPS.findIndex((s) => s.id === step)
  const current = STEPS[index] ?? STEPS[0]!
  const isLast = index === STEPS.length - 1
  const Icon = current.icon

  function goNext() {
    if (isLast) {
      markOnboardingSeen()
      navigate({ to: '/start' })
    } else {
      navigate({ to: '/onboarding/$step', params: { step: STEPS[index + 1]!.id } })
    }
  }

  return (
    <div className="flex min-h-svh flex-col bg-cream px-6 pb-10 pt-12">
      <div className="flex justify-between">
        <div className="flex gap-1.5" role="tablist" aria-label="Progreso de introducción">
          {STEPS.map((s, i) => (
            <span
              key={s.id}
              role="tab"
              aria-selected={i === index}
              className={`h-1.5 w-8 rounded-pill ${i <= index ? 'bg-violet' : 'bg-night/10'}`}
            />
          ))}
        </div>
        <Link to="/start" onClick={markOnboardingSeen} className="text-[15px] font-bold text-muted">
          Omitir
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex h-28 w-28 items-center justify-center rounded-card bg-violet/10">
          <Icon size={48} className="text-violet" aria-hidden="true" />
        </div>
        <h1 className="text-[32px] font-extrabold leading-[38px] text-ink">{current.title}</h1>
        <p className="max-w-xs text-[17px] leading-[26px] text-muted">{current.description}</p>
      </div>

      <Button onClick={goNext} className="w-full">
        {isLast ? 'Comenzar' : 'Siguiente'}
      </Button>
    </div>
  )
}
