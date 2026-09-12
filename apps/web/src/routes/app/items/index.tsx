import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { TagStatusBadge } from '../../../components/ui/TagStatusBadge'
import { PhotoFrame } from '../../../components/ui/PhotoFrame'
import { CardSkeleton, EmptyState, ErrorState } from '../../../components/ui/StateViews'
import { useMyItems } from '../../../features/owner/useMyItems'
import { ITEM_TYPE_LABEL } from '@meperdi/domain'

export const Route = createFileRoute('/app/items/')({
  component: MyItemsScreen,
})

/** D02 — Mis tags: tarjetas con foto, nombre, tipo, estado. */
function MyItemsScreen() {
  const { data: items, isPending, isError, refetch } = useMyItems()

  return (
    <Screen className="pb-4 pt-8">
      <ScreenHeader
        title="Mis tags"
        showBack={false}
        trailing={
          <Button asChild size="compact" variant="ghost">
            <Link to="/scan">
              <Plus size={20} aria-hidden="true" />
            </Link>
          </Button>
        }
      />

      <div className="space-y-3">
        {isPending && (
          <>
            <CardSkeleton />
            <CardSkeleton />
          </>
        )}
        {isError && <ErrorState title="No pudimos cargar tus tags" onRetry={() => refetch()} />}
        {items && items.length === 0 && <EmptyState title="Todavía no tienes tags" description="Activa uno para empezar." />}
        {items?.map((item) => (
          <Link key={item.itemId} to="/app/items/$id" params={{ id: item.itemId }}>
            <Card className="flex items-center gap-4">
              <PhotoFrame src={item.photoUrl} alt={item.name} className="h-16 w-16 shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] font-extrabold text-ink">{item.name}</p>
                <p className="text-[13px] text-muted">{ITEM_TYPE_LABEL[item.itemType]}</p>
              </div>
              <TagStatusBadge status={item.tagStatus} />
            </Card>
          </Link>
        ))}
      </div>
    </Screen>
  )
}
