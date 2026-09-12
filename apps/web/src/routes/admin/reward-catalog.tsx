import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Gift } from 'lucide-react'
import { listRewardCatalog } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/reward-catalog')({
  component: RewardCatalogScreen,
})

/** AD07 — Catálogo de premios: aliado, inventario, costo, segmentación, vigencia y prioridad. */
function RewardCatalogScreen() {
  const query = useQuery({ queryKey: ['admin-reward-catalog'], queryFn: listRewardCatalog })

  return (
    <div>
      <AdminPageHeader icon={Gift} title="Catálogo de premios" description="Aliado, inventario, costo, segmentación, vigencia y prioridad." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((entry) => (
          <Card key={entry.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[13px] font-semibold text-muted">{entry.partnerName}</p>
                <p className="text-[16px] font-extrabold text-ink">{entry.item}</p>
              </div>
              <span className="whitespace-nowrap rounded-pill bg-violet/10 px-3 py-1 text-[13px] font-bold text-violet">
                Prioridad {entry.priority}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[18px] font-extrabold text-ink">{entry.inventory}</p>
                <p className="text-[12px] text-muted">Inventario</p>
              </div>
              <div>
                <p className="text-[18px] font-extrabold text-ink">Bs {entry.costBs}</p>
                <p className="text-[12px] text-muted">Costo</p>
              </div>
              <div>
                <p className="text-[13px] font-bold text-ink">{new Date(entry.validUntil).toLocaleDateString('es-BO', { dateStyle: 'short' })}</p>
                <p className="text-[12px] text-muted">Vigencia</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-muted">Segmento: {entry.segment}</p>
          </Card>
        ))}
      </div>
    </div>
  )
}
