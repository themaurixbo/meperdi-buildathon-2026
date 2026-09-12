import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { BookOpenCheck } from 'lucide-react'
import { assignAdminCase, listAdminCases } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/cases')({
  component: AdminCasesScreen,
})

const KIND_LABEL: Record<string, string> = { finder_report: 'Aviso', return: 'Devolución', dispute: 'Disputa' }
const STATUS_LABEL: Record<string, string> = { open: 'Abierto', in_review: 'En revisión', resolved: 'Resuelto' }

/** AD05 — Casos: avisos, devoluciones, disputas, SLA y asignación. */
function AdminCasesScreen() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-cases'], queryFn: listAdminCases })

  const assign = useMutation({
    mutationFn: (caseId: string) => assignAdminCase(caseId, 'Yo'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-cases'] }),
  })

  return (
    <div>
      <AdminPageHeader icon={BookOpenCheck} title="Casos" description="Avisos, devoluciones, disputas, SLA y asignación." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="rounded-pill bg-violet/10 px-2.5 py-1 text-[12px] font-bold text-violet">{KIND_LABEL[c.kind]}</span>
                <p className="mt-2 text-[16px] font-extrabold text-ink">{c.summary}</p>
              </div>
              <span
                className={`whitespace-nowrap rounded-pill px-3 py-1 text-[13px] font-bold ${
                  c.slaHoursLeft <= 8 ? 'bg-danger/12 text-danger' : 'bg-night/5 text-ink'
                }`}
              >
                SLA {c.slaHoursLeft}h
              </span>
            </div>
            <p className="mt-2 text-[13px] text-muted">
              {STATUS_LABEL[c.status]} · {c.assignedTo ? `Asignado a ${c.assignedTo}` : 'Sin asignar'}
            </p>
            {!c.assignedTo && (
              <Button variant="secondary" size="compact" className="mt-3" loading={assign.isPending} onClick={() => assign.mutate(c.id)}>
                Asignarme
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
