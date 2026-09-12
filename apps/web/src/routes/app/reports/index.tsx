import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { MapPin, MessageSquare } from 'lucide-react'
import { listMyReports } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { CardSkeleton, EmptyState, ErrorState } from '../../../components/ui/StateViews'

export const Route = createFileRoute('/app/reports/')({
  component: ReportsScreen,
})

/** D07 — Avisos: timeline de escaneos, mensajes y ubicaciones consentidas. */
function ReportsScreen() {
  const query = useQuery({ queryKey: ['owner-reports'], queryFn: listMyReports })

  return (
    <Screen className="pb-4 pt-8">
      <ScreenHeader title="Avisos" showBack={false} />

      {query.isPending && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {query.isError && <ErrorState title="No pudimos cargar tus avisos" onRetry={() => query.refetch()} />}

      {query.data && query.data.length === 0 && (
        <EmptyState title="Todavía no hay avisos" description="Cuando alguien avise sobre uno de tus tags, lo verás aquí." />
      )}

      <div className="space-y-3">
        {query.data?.map((report) => (
          <Link key={report.caseNumber} to="/app/reports/$caseNumber" params={{ caseNumber: report.caseNumber }}>
            <Card>
              <div className="flex items-center justify-between">
                <p className="text-[15px] font-extrabold text-ink">{report.itemName}</p>
                <span className="text-[13px] text-muted">{report.caseNumber}</span>
              </div>
              {report.message && <p className="mt-1 text-[15px] text-muted">"{report.message}"</p>}
              <div className="mt-2 flex gap-3 text-[13px] text-muted">
                {report.locationShared && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} aria-hidden="true" /> Ubicación compartida
                  </span>
                )}
                {report.message && (
                  <span className="flex items-center gap-1">
                    <MessageSquare size={14} aria-hidden="true" /> Con mensaje
                  </span>
                )}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </Screen>
  )
}
