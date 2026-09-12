import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ArrowRightLeft, CheckCircle2, Home, KeyRound, MapPin, MessageSquare, PauseCircle, ScanLine, Trash2 } from 'lucide-react'
import { getTagActivity } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { Card } from '../../../../components/ui/Card'
import { CardSkeleton, EmptyState, ErrorState } from '../../../../components/ui/StateViews'

export const Route = createFileRoute('/app/items/$id/activity')({
  component: ActivityScreen,
})

const EVENT_LABEL: Record<string, { label: string; icon: typeof ScanLine }> = {
  scan: { label: 'Escaneo', icon: ScanLine },
  finder_report: { label: 'Avisó "estoy aquí"', icon: MessageSquare },
  location_shared: { label: 'Ubicación compartida', icon: MapPin },
  activated: { label: 'Tag activado', icon: KeyRound },
  lost_declared: { label: 'Pérdida declarada', icon: MapPin },
  return_confirmed: { label: 'Devolución confirmada', icon: CheckCircle2 },
  returned_home: { label: 'Marcado "ya volvió"', icon: Home },
  transferred: { label: 'Tag transferido', icon: ArrowRightLeft },
  deactivated: { label: 'Tag desactivado', icon: PauseCircle },
  deleted: { label: 'Perfil eliminado', icon: Trash2 },
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('es-BO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/** Historial de actividad del tag — cada escaneo, aviso y ubicación, del más reciente al más antiguo. */
function ActivityScreen() {
  const { id } = Route.useParams()
  const query = useQuery({ queryKey: ['tag-activity', id], queryFn: () => getTagActivity(id) })

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title="Historial de actividad" />

      <p className="mb-4 text-[15px] text-muted">
        Cada vez que alguien escanea este tag, envía un aviso o comparte su ubicación queda registrado aquí, del
        más reciente al más antiguo.
      </p>

      {query.isPending && (
        <div className="space-y-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {query.isError && <ErrorState title="No pudimos cargar el historial" onRetry={() => query.refetch()} />}

      {query.data && query.data.length === 0 && (
        <EmptyState title="Todavía no hay actividad" description="En cuanto alguien escanee este tag, lo verás aquí." />
      )}

      <div className="space-y-3">
        {query.data?.map((event) => {
          const meta = EVENT_LABEL[event.type] ?? { label: event.type, icon: ScanLine }
          const Icon = meta.icon
          return (
            <Card key={event.id} className="!p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
                  <Icon size={16} className="text-violet" aria-hidden="true" />
                  {meta.label}
                </span>
                <span className="text-[13px] text-muted">{formatDateTime(event.occurredAt)}</span>
              </div>
              <dl className="mt-2 space-y-1 text-[13px] text-muted">
                <div className="flex justify-between gap-3">
                  <dt>Dispositivo</dt>
                  <dd className="text-right text-ink">{event.deviceSummary ?? 'No disponible'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>IP aproximada</dt>
                  <dd className="text-right text-ink">{event.ip ?? 'No disponible'}</dd>
                </div>
                {event.lat !== undefined && event.lng !== undefined && (
                  <div className="flex justify-between gap-3">
                    <dt>Coordenadas</dt>
                    <dd className="text-right text-ink">
                      {event.lat.toFixed(4)}, {event.lng.toFixed(4)}
                    </dd>
                  </div>
                )}
                {event.locationNote && (
                  <div className="flex justify-between gap-3">
                    <dt>Nota</dt>
                    <dd className="text-right text-ink">{event.locationNote}</dd>
                  </div>
                )}
              </dl>
            </Card>
          )
        })}
      </div>
    </Screen>
  )
}
