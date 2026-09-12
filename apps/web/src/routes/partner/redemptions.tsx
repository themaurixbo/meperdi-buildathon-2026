import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Download, ListFilter } from 'lucide-react'
import { listPartnerRedemptions } from '@meperdi/api-client'
import { Screen } from '../../components/ui/Screen'
import { Card } from '../../components/ui/Card'
import { Chip } from '../../components/ui/Chip'
import { CardSkeleton, EmptyState } from '../../components/ui/StateViews'

export const Route = createFileRoute('/partner/redemptions')({
  component: RedemptionsScreen,
})

type StatusFilter = 'all' | 'settled' | 'pending'

/** P03 — Redenciones: historial, filtros, exportación y estado de liquidación. */
function RedemptionsScreen() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const query = useQuery({ queryKey: ['partner-redemptions'], queryFn: listPartnerRedemptions })

  const filtered = useMemo(() => {
    const rows = query.data ?? []
    return filter === 'all' ? rows : rows.filter((r) => r.status === filter)
  }, [query.data, filter])

  function exportCsv() {
    const header = 'Código,Local,Fecha,Estado\n'
    const rows = filtered
      .map((r) => `${r.code},${r.partnerLocationId},${new Date(r.redeemedAt).toISOString()},${r.status}`)
      .join('\n')
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'redenciones-me-perdi.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Screen className="pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-ink">Redenciones</h1>
        <button
          type="button"
          onClick={exportCsv}
          disabled={!filtered.length}
          className="flex items-center gap-1.5 rounded-button bg-white px-3 py-2 text-[14px] font-bold text-ink shadow-card disabled:opacity-40"
        >
          <Download size={16} aria-hidden="true" /> Exportar
        </button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <ListFilter size={16} className="text-muted" aria-hidden="true" />
        {(['all', 'settled', 'pending'] as const).map((value) => (
          <button key={value} type="button" onClick={() => setFilter(value)}>
            <Chip tone={filter === value ? 'violet' : 'muted'}>
              {value === 'all' ? 'Todas' : value === 'settled' ? 'Liquidadas' : 'Pendientes'}
            </Chip>
          </button>
        ))}
      </div>

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}
      {query.isSuccess && filtered.length === 0 && (
        <EmptyState title="Sin redenciones" description="Todavía no hay canjes con este filtro." />
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((r) => (
          <Card key={r.id} className="flex items-center justify-between">
            <div>
              <p className="text-[17px] font-extrabold text-ink">{r.code}</p>
              <p className="text-[14px] text-muted">
                {new Date(r.redeemedAt).toLocaleString('es-BO', { dateStyle: 'medium', timeStyle: 'short' })}
              </p>
            </div>
            <span
              className={`rounded-pill px-3 py-1 text-[13px] font-bold ${
                r.status === 'settled' ? 'bg-aqua/15 text-ink' : 'bg-lime/25 text-ink'
              }`}
            >
              {r.status === 'settled' ? 'Liquidada' : 'Pendiente'}
            </span>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
