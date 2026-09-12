import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, RefreshCcw, Share2 } from 'lucide-react'
import { getTagActivity, markItemHome } from '@meperdi/api-client'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'

/** D06 — Pérdida activa: métricas desde el historial de actividad + acciones rápidas. */
export function LostActiveCard({
  itemId,
  itemName,
  publicSlug,
}: {
  itemId: string
  itemName: string
  publicSlug: string
}) {
  const queryClient = useQueryClient()
  const activity = useQuery({ queryKey: ['tag-activity', itemId], queryFn: () => getTagActivity(itemId) })

  const markHome = useMutation({
    mutationFn: () => markItemHome(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner-item', itemId] })
      queryClient.invalidateQueries({ queryKey: ['tag-activity', itemId] })
    },
  })

  const scans = activity.data?.filter((e) => e.type === 'scan').length ?? 0
  const reports = activity.data?.filter((e) => e.type === 'finder_report' || e.type === 'location_shared').length ?? 0
  const lastEvent = activity.data?.[0]

  function shareFlyer() {
    const url = `${window.location.origin}/t/${publicSlug}`
    const text = `¡Ayúdame a encontrar a ${itemName}! Si lo ves, escanea este enlace: ${url}`
    if (navigator.share) {
      navigator.share({ title: 'ME PERDÍ', text, url }).catch(() => {})
    } else {
      navigator.clipboard?.writeText(text)
    }
  }

  return (
    <Card className="border-2 border-coral/20 bg-coral/5">
      <p className="mb-3 text-[15px] font-bold text-[#b0165a]">Pérdida activa</p>

      <div className="mb-4 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-[22px] font-extrabold text-ink">{scans}</p>
          <p className="text-[12px] text-muted">Escaneos</p>
        </div>
        <div>
          <p className="text-[22px] font-extrabold text-ink">{reports}</p>
          <p className="text-[12px] text-muted">Avisos</p>
        </div>
        <div>
          <p className="text-[13px] font-bold text-ink">{lastEvent ? 'Reciente' : 'Sin señales'}</p>
          <p className="text-[12px] text-muted">Última señal</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Button asChild size="compact" variant="secondary">
          <Link to="/app/items/$id/lost" params={{ id: itemId }}>
            <RefreshCcw size={16} aria-hidden="true" /> Actualizar
          </Link>
        </Button>
        <Button size="compact" variant="secondary" onClick={shareFlyer}>
          <Share2 size={16} aria-hidden="true" /> Compartir cartel
        </Button>
        <Button size="compact" loading={markHome.isPending} onClick={() => markHome.mutate()}>
          <CheckCircle2 size={16} aria-hidden="true" /> Ya volvió
        </Button>
      </div>
    </Card>
  )
}
