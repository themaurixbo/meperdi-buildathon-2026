import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle } from 'lucide-react'
import { listRiskSignals, resolveRiskSignal } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/risk')({
  component: RiskScreen,
})

const TYPE_LABEL: Record<string, string> = {
  scan_velocity: 'Velocidad de escaneos',
  duplicate_account: 'Cuentas duplicadas',
  geo_anomaly: 'Geolocalización anómala',
}
const SEVERITY_CLASSES: Record<string, string> = {
  low: 'bg-night/5 text-ink',
  medium: 'bg-lime/25 text-[#4b5400]',
  high: 'bg-danger/12 text-danger',
}
const STATUS_LABEL: Record<string, string> = { open: 'Abierta', blocked: 'Bloqueada', cleared: 'Descartada' }

/** AD09 — Riesgo y fraude: velocidad de escaneos, cuentas duplicadas, geolocalización anómala y bloqueos. */
function RiskScreen() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-risk'], queryFn: listRiskSignals })

  const resolve = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'block' | 'clear' }) => resolveRiskSignal(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-risk'] }),
  })

  return (
    <div>
      <AdminPageHeader icon={AlertTriangle} title="Riesgo y fraude" description="Velocidad de escaneos, cuentas duplicadas, geolocalización anómala y bloqueos." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((signal) => (
          <Card key={signal.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-muted">{TYPE_LABEL[signal.type]}</p>
                <p className="mt-0.5 text-[15px] font-bold text-ink">{signal.description}</p>
              </div>
              <span className={`whitespace-nowrap rounded-pill px-3 py-1 text-[13px] font-bold ${SEVERITY_CLASSES[signal.severity]}`}>
                {signal.severity === 'low' ? 'Baja' : signal.severity === 'medium' ? 'Media' : 'Alta'}
              </span>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {STATUS_LABEL[signal.status]} · {new Date(signal.detectedAt).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>
            {signal.status === 'open' && (
              <div className="mt-3 flex gap-2">
                <Button variant="secondary" size="compact" className="flex-1" loading={resolve.isPending} onClick={() => resolve.mutate({ id: signal.id, action: 'clear' })}>
                  Descartar
                </Button>
                <Button variant="danger" size="compact" className="flex-1" loading={resolve.isPending} onClick={() => resolve.mutate({ id: signal.id, action: 'block' })}>
                  Bloquear
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
