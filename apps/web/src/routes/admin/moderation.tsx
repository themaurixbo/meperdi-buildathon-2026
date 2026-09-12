import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ShieldAlert } from 'lucide-react'
import { listModerationReports, resolveModerationReport } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CardSkeleton, EmptyState } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/moderation')({
  component: ModerationScreen,
})

const FIELD_LABEL: Record<string, string> = { photo: 'Foto', public_message: 'Mensaje público' }
const STATUS_LABEL: Record<string, string> = { pending: 'Pendiente', warned: 'Advertido', suspended: 'Suspendido', dismissed: 'Descartado' }

/** AD04 — Perfiles y moderación: fotos/textos reportados, advertencias y suspensión. */
function ModerationScreen() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-moderation'], queryFn: listModerationReports })

  const resolve = useMutation({
    mutationFn: ({ id, action }: { id: string; action: 'warn' | 'suspend' | 'dismiss' }) => resolveModerationReport(id, action),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-moderation'] }),
  })

  return (
    <div>
      <AdminPageHeader icon={ShieldAlert} title="Perfiles y moderación" description="Fotos/textos reportados, advertencias y suspensión." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}
      {query.isSuccess && query.data.length === 0 && <EmptyState title="Sin reportes" description="No hay contenido reportado por revisar." />}

      <div className="flex flex-col gap-3">
        {query.data?.map((report) => (
          <Card key={report.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-extrabold text-ink">{report.itemName}</p>
                <p className="text-[13px] text-muted">{FIELD_LABEL[report.field]} reportado(a)</p>
              </div>
              <span
                className={`whitespace-nowrap rounded-pill px-3 py-1 text-[13px] font-bold ${
                  report.status === 'pending' ? 'bg-lime/25 text-[#4b5400]' : 'bg-night/5 text-ink'
                }`}
              >
                {STATUS_LABEL[report.status]}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-ink">{report.reason}</p>
            <p className="mt-1 text-[13px] text-muted">
              {new Date(report.reportedAt).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
            </p>

            {report.status === 'pending' && (
              <div className="mt-4 flex gap-2">
                <Button variant="secondary" size="compact" className="flex-1" loading={resolve.isPending} onClick={() => resolve.mutate({ id: report.id, action: 'dismiss' })}>
                  Descartar
                </Button>
                <Button variant="secondary" size="compact" className="flex-1" loading={resolve.isPending} onClick={() => resolve.mutate({ id: report.id, action: 'warn' })}>
                  Advertir
                </Button>
                <Button variant="danger" size="compact" className="flex-1" loading={resolve.isPending} onClick={() => resolve.mutate({ id: report.id, action: 'suspend' })}>
                  Suspender
                </Button>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
