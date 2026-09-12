import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Landmark } from 'lucide-react'
import { getCommunityFund } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/fund')({
  component: FundScreen,
})

const KIND_LABEL: Record<string, string> = { income: 'Ingreso', reserve: 'Reserva', payout: 'Premio emitido' }

/** AD06 — Fondo comunitario: entradas, reservas, premios emitidos, conciliación y alertas de saldo. */
function FundScreen() {
  const query = useQuery({ queryKey: ['admin-fund'], queryFn: getCommunityFund })
  const balance = query.data?.balance ?? 0

  return (
    <div>
      <AdminPageHeader icon={Landmark} title="Fondo comunitario" description="Entradas, reservas, premios emitidos y conciliación." />

      {query.isLoading && <CardSkeleton />}

      {query.data && (
        <Card className={`mb-5 ${balance < 500 ? 'border-2 border-danger/30' : ''}`}>
          <p className="text-[13px] font-semibold text-muted">Saldo actual</p>
          <p className="mt-1 text-[28px] font-extrabold text-ink">Bs {balance.toLocaleString('es-BO')}</p>
          {balance < 500 && <p className="mt-1 text-[14px] font-semibold text-danger">Saldo bajo — considera reponer el fondo.</p>}
        </Card>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.entries.map((entry) => (
          <Card key={entry.id} className="flex items-center justify-between">
            <div>
              <p className="text-[15px] font-bold text-ink">{entry.description}</p>
              <p className="text-[13px] text-muted">
                {KIND_LABEL[entry.kind]} · {new Date(entry.occurredAt).toLocaleDateString('es-BO', { dateStyle: 'medium' })}
              </p>
            </div>
            <span className={`whitespace-nowrap text-[16px] font-extrabold ${entry.amountBs >= 0 ? 'text-ink' : 'text-danger'}`}>
              {entry.amountBs >= 0 ? '+' : ''}
              {entry.amountBs.toLocaleString('es-BO')} Bs
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
