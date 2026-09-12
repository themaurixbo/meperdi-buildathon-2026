import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AlertOctagon, MessageCircle, Phone } from 'lucide-react'
import { getReportDetail } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { PhotoFrame } from '../../../components/ui/PhotoFrame'
import { CardSkeleton, ErrorState } from '../../../components/ui/StateViews'
import { LocationMap } from '../../../features/location/LocationMap'

export const Route = createFileRoute('/app/reports/$caseNumber')({
  component: ReportDetailScreen,
})

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** D08 — Detalle de aviso: mapa que solo ve el propietario, mensaje, responder, reportar abuso. */
function ReportDetailScreen() {
  const { caseNumber } = Route.useParams()
  const query = useQuery({ queryKey: ['report-detail', caseNumber], queryFn: () => getReportDetail(caseNumber) })
  const [reported, setReported] = useState(false)

  if (query.isPending) {
    return (
      <Screen className="pt-8">
        <CardSkeleton />
      </Screen>
    )
  }

  if (query.isError || !query.data) {
    return (
      <Screen className="pt-8">
        <ErrorState title="No pudimos cargar este aviso" onRetry={() => query.refetch()} />
      </Screen>
    )
  }

  const report = query.data

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title={`Caso ${report.caseNumber}`} />

      <div className="mb-5 flex items-center gap-3">
        <PhotoFrame src={report.itemPhotoUrl} alt={report.itemName} className="h-14 w-14 rounded-full" />
        <div>
          <p className="text-[17px] font-extrabold text-ink">{report.itemName}</p>
          <p className="text-[13px] text-muted">{formatDateTime(report.createdAt)}</p>
        </div>
      </div>

      {report.message && (
        <Card className="mb-5">
          <p className="text-[13px] font-bold text-muted">Mensaje</p>
          <p className="mt-1 text-[17px] text-ink">"{report.message}"</p>
        </Card>
      )}

      {report.sharedLocation && (
        <div className="mb-5">
          <p className="mb-2 text-[13px] font-bold text-muted">Ubicación compartida (solo tú la ves)</p>
          <LocationMap
            lat={report.sharedLocation.lat}
            lng={report.sharedLocation.lng}
            interactive={false}
            className="h-56 w-full overflow-hidden rounded-card"
          />
          <p className="mt-2 text-[13px] text-muted">Precisión aproximada: {Math.round(report.sharedLocation.accuracyM)} m.</p>
          {report.sharedLocation.note && (
            <Card className="mt-2 bg-violet/5 text-[14px] text-violet">Nota: {report.sharedLocation.note}</Card>
          )}
        </div>
      )}

      {report.contactOptIn && report.contactPhoneE164 && (
        <div className="mb-5 grid grid-cols-2 gap-3">
          <Button asChild variant="secondary" className="w-full">
            <a href={`tel:${report.contactPhoneE164}`}>
              <Phone size={20} aria-hidden="true" /> Llamar
            </a>
          </Button>
          <Button asChild variant="secondary" className="w-full">
            <a href={`https://wa.me/${report.contactPhoneE164.replace('+', '')}`} target="_blank" rel="noreferrer">
              <MessageCircle size={20} aria-hidden="true" /> WhatsApp
            </a>
          </Button>
        </div>
      )}

      {reported ? (
        <p className="text-center text-[15px] font-semibold text-[#0b6b58]">
          Gracias, nuestro equipo va a revisar este aviso.
        </p>
      ) : (
        <button
          type="button"
          onClick={() => setReported(true)}
          className="flex w-full items-center justify-center gap-2 text-[15px] font-semibold text-muted underline"
        >
          <AlertOctagon size={16} aria-hidden="true" /> Reportar abuso
        </button>
      )}
    </Screen>
  )
}
