import { createFileRoute, Link } from '@tanstack/react-router'
import { HandHeart, QrCode, ShieldCheck, Sparkles } from 'lucide-react'
import { Screen, ScreenHeader } from '../components/ui/Screen'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'

export const Route = createFileRoute('/help')({
  component: HelpScreen,
})

const STEPS = [
  {
    icon: QrCode,
    title: 'Activa tu tag',
    text: 'Regístralo con tu cuenta y el PIN privado que viene con el tag. Luego, asócialo a la mascota u objeto que deseas proteger.',
  },
  {
    icon: HandHeart,
    title: 'Alguien lo encuentra',
    text: 'Escanea el tag y puede avisarte, compartir su ubicación o escribirte sin crear una cuenta.',
  },
  {
    icon: ShieldCheck,
    title: 'Coordinan la devolución',
    text: 'Un código de un solo uso confirma la entrega de forma segura.',
  },
  {
    icon: Sparkles,
    title: 'La comunidad agradece',
    text: 'Quien ayudó a devolverlo recibe un premio del fondo comunitario, no de tu bolsillo.',
  },
]

/** Ayuda y seguridad — sección 6.1. */
function HelpScreen() {
  return (
    <Screen>
      <ScreenHeader title="Cómo funciona" />

      <div className="mb-6">
        <p className="text-[20px] font-extrabold leading-[26px] text-ink">Hoy por mí, mañana por ti.</p>
        <p className="mt-2 text-[15px] leading-[22px] text-muted">
          Creemos en una comunidad más empática, donde todos nos ayudamos a recuperar una mascota querida o un
          objeto importante.
        </p>
      </div>

      <div className="space-y-3">
        {STEPS.map((s, i) => (
          <Card key={s.title} className="flex items-start gap-4 !py-5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-violet/10 text-[15px] font-extrabold text-violet">
              {i + 1}
            </div>
            <div>
              <p className="flex items-center gap-2 text-[17px] font-extrabold leading-[22px] text-ink">
                <s.icon size={18} aria-hidden="true" /> {s.title}
              </p>
              <p className="mt-1.5 text-[15px] leading-[22px] text-muted">{s.text}</p>
            </div>
          </Card>
        ))}
      </div>

      <Button asChild className="mt-8 w-full">
        <Link to="/start">Empezar</Link>
      </Button>
    </Screen>
  )
}
