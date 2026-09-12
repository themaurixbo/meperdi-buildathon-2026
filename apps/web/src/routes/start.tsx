import { createFileRoute, Link } from '@tanstack/react-router'
import { BookOpen, KeyRound, ScanLine } from 'lucide-react'
import { Screen, ScreenHeader } from '../components/ui/Screen'
import { Card } from '../components/ui/Card'

export const Route = createFileRoute('/start')({
  component: ChooseActionScreen,
})

/** A06 — Elegir acción: una decisión principal por pantalla, tres caminos claros. */
function ChooseActionScreen() {
  return (
    <Screen>
      <ScreenHeader showBack={false} />
      <h1 className="mb-6 text-[32px] font-extrabold leading-[38px] text-ink">¿Qué quieres hacer?</h1>

      <div className="flex flex-col gap-4">
        <ActionCard to="/scan" icon={KeyRound} title="Activar un tag" description="Ya tengo mi tag físico y quiero registrar a mi mascota u objeto." />
        <ActionCard to="/scan" icon={ScanLine} title="Escanear un tag" description="Encontré un tag ME PERDÍ y quiero ayudar a que vuelva a casa." />
        <ActionCard to="/help" icon={BookOpen} title="Saber cómo funciona" description="Quiero entender el proceso antes de decidir." />
      </div>
    </Screen>
  )
}

function ActionCard({
  to,
  icon: Icon,
  title,
  description,
}: {
  to: string
  icon: typeof KeyRound
  title: string
  description: string
}) {
  return (
    <Link to={to}>
      <Card className="flex items-start gap-4 transition hover:shadow-[0_16px_32px_-14px_rgba(11,16,38,0.25)]">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-card bg-violet/10">
          <Icon size={28} className="text-violet" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[17px] font-extrabold text-ink">{title}</p>
          <p className="mt-1 text-[15px] text-muted">{description}</p>
        </div>
      </Card>
    </Link>
  )
}
