import { createFileRoute, Link } from '@tanstack/react-router'
import { CheckCircle2, MapPin, MessageSquare } from 'lucide-react'
import { Screen } from '../../../components/ui/Screen'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useFinderReportStore } from '../../../stores/finderReportStore'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/found')({
  component: FoundConfirmationScreen,
})

/** F09/F10 — Aviso enviado y seguimiento como invitado. */
function FoundConfirmationScreen() {
  useNoIndex()
  const { publicSlug } = Route.useParams()
  const report = useFinderReportStore((s) => s.getReport(publicSlug))

  return (
    <Screen className="flex min-h-svh flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-card bg-lime/25">
        <CheckCircle2 size={44} className="text-[#4b5400]" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">¡Gracias! Tu aviso ya está en camino.</h1>
        <p className="mt-2 text-[17px] text-muted">El propietario ya recibió tu aviso.</p>
        {report && <p className="mt-1 text-[15px] font-semibold text-muted">Caso {report.caseNumber}</p>}
      </div>

      <Card className="w-full bg-night/5 text-left text-[15px] text-muted">
        Guardamos este enlace en tu dispositivo. Puedes volver cuando quieras para añadir más información.
      </Card>

      <div className="grid w-full grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="w-full">
          <Link to="/t/$publicSlug/location" params={{ publicSlug }}>
            <MapPin size={20} aria-hidden="true" /> Ubicación
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/t/$publicSlug/message" params={{ publicSlug }}>
            <MessageSquare size={20} aria-hidden="true" /> Mensaje
          </Link>
        </Button>
      </div>

      <Button asChild variant="ghost" className="w-full">
        <Link to="/t/$publicSlug" params={{ publicSlug }}>
          Volver al perfil
        </Link>
      </Button>
    </Screen>
  )
}
