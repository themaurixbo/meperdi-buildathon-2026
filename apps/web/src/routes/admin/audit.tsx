import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ScrollText } from 'lucide-react'
import { listAuditLog } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { CardSkeleton, EmptyState } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/audit')({
  component: AuditScreen,
})

/** AD10 — Auditoría: actor, fecha, IP resumida, acción, objeto, antes/después y motivo. */
function AuditScreen() {
  const query = useQuery({ queryKey: ['admin-audit'], queryFn: listAuditLog })

  return (
    <div>
      <AdminPageHeader icon={ScrollText} title="Auditoría" description="Actor, fecha, IP resumida, acción, objeto, antes/después y motivo." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}
      {query.isSuccess && query.data.length === 0 && <EmptyState title="Sin actividad" description="Todavía no hay acciones registradas." />}

      <div className="flex flex-col gap-3">
        {query.data?.map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[15px] font-extrabold text-ink">{entry.action}</p>
              <p className="whitespace-nowrap text-[13px] text-muted">
                {new Date(entry.occurredAt).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <p className="mt-1 text-[14px] text-ink">{entry.object}</p>
            {(entry.before || entry.after) && (
              <p className="mt-1 text-[13px] text-muted">
                {entry.before ?? '—'} → {entry.after ?? '—'}
              </p>
            )}
            <p className="mt-2 text-[13px] text-muted">{entry.reason}</p>
            <p className="mt-1 text-[12px] text-muted">
              {entry.actor} · IP {entry.ipSummary}
            </p>
          </Card>
        ))}
      </div>
    </div>
  )
}
