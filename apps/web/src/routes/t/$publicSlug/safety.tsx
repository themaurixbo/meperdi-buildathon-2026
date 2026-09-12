import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, Car, Dog, ShieldAlert } from 'lucide-react'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/safety')({
  component: SafetyTipsScreen,
})

const TIPS = [
  { icon: Dog, title: 'Mascota asustada', text: 'Acércate despacio, sin correr ni gritar. Deja que se acerque ella.' },
  { icon: ShieldAlert, title: 'Animal agresivo', text: 'No lo fuerces. Mantén distancia y busca ayuda de protección animal.' },
  { icon: Car, title: 'Tráfico', text: 'Nunca te expongas cruzando calles con riesgo por alcanzar a la mascota u objeto.' },
  { icon: AlertTriangle, title: 'Objeto peligroso', text: 'Si algo parece riesgoso o inestable, no lo manipules. Avisa a las autoridades.' },
]

/** F08 — Consejos seguros: "No te pongas en riesgo". */
function SafetyTipsScreen() {
  useNoIndex()
  return (
    <Screen>
      <ScreenHeader title="Ayudar con seguridad" />
      <p className="mb-6 text-[17px] text-muted">Ayudar no significa ponerte en riesgo.</p>

      <div className="space-y-3">
        {TIPS.map((tip) => (
          <Card key={tip.title} className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-coral/10">
              <tip.icon size={22} className="text-[#b0165a]" aria-hidden="true" />
            </div>
            <div>
              <p className="text-[17px] font-extrabold text-ink">{tip.title}</p>
              <p className="mt-1 text-[15px] text-muted">{tip.text}</p>
            </div>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
