import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { AlertCircle, Plus } from 'lucide-react'
import { Screen } from '../../components/ui/Screen'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TagStatusBadge } from '../../components/ui/TagStatusBadge'
import { PhotoFrame } from '../../components/ui/PhotoFrame'
import { CardSkeleton, EmptyState, ErrorState } from '../../components/ui/StateViews'
import { useMyItems } from '../../features/owner/useMyItems'
import { useAuthStore } from '../../stores/authStore'

export const Route = createFileRoute('/app/')({
  component: OwnerHomeScreen,
})

/** D01 — Inicio: saludo, estado de cada tag, CTA declarar pérdida. */
function OwnerHomeScreen() {
  const session = useAuthStore((s) => s.session)
  const navigate = useNavigate()
  const { data: items, isPending, isError, refetch } = useMyItems()
  const firstName = session?.displayName.split(' ')[0] ?? 'de vuelta'

  return (
    <Screen className="pb-4 pt-8">
      <h1 className="text-[28px] font-extrabold text-ink">Hola, {firstName}</h1>
      <p className="mt-1 text-[17px] text-muted">Así están tus tags hoy.</p>

      <div className="mt-6 space-y-3">
        {isPending && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}

        {isError && <ErrorState title="No pudimos cargar tus tags" onRetry={() => refetch()} />}

        {items && items.length === 0 && (
          <EmptyState
            title="Todavía no tienes tags"
            description="Activa tu primer tag para proteger a tu mascota u objeto."
            action={
              <Button asChild>
                <Link to="/scan">
                  <Plus size={20} aria-hidden="true" /> Activar mi primer tag
                </Link>
              </Button>
            }
          />
        )}

        {items?.map((item) => (
          <Link key={item.itemId} to="/app/items/$id" params={{ id: item.itemId }}>
            <Card className="flex items-center gap-4">
              <PhotoFrame src={item.photoUrl} alt={item.name} className="h-16 w-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-extrabold text-ink">{item.name}</p>
                <div className="mt-1">
                  <TagStatusBadge status={item.tagStatus} />
                </div>
              </div>
              {item.tagStatus === 'ACTIVE' && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    navigate({ to: '/app/items/$id/lost', params: { id: item.itemId } })
                  }}
                  className="flex items-center gap-1 rounded-pill bg-coral/10 px-3 py-1.5 text-[13px] font-bold text-[#b0165a]"
                >
                  <AlertCircle size={14} aria-hidden="true" /> Perdido
                </button>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </Screen>
  )
}
