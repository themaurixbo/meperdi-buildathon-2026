import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { deactivateItem, deleteItem } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { Card } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'

export const Route = createFileRoute('/app/items/$id/delete')({
  component: DeactivateOrDeleteScreen,
})

type Action = 'deactivate' | 'delete'

/** D13 — Eliminar o desactivar, con doble confirmación explicando la diferencia. */
function DeactivateOrDeleteScreen() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const [action, setAction] = useState<Action | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateItem(id),
    onSuccess: () => navigate({ to: '/app/items' }),
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteItem(id),
    onSuccess: () => navigate({ to: '/app/items' }),
  })

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title="Eliminar o desactivar" />

      <div className="mb-5 space-y-3">
        <Card
          className={`cursor-pointer !p-4 ${action === 'deactivate' ? 'border-2 border-violet' : ''}`}
          onClick={() => {
            setAction('deactivate')
            setConfirmed(false)
          }}
        >
          <p className="text-[16px] font-extrabold text-ink">Desactivar (reversible)</p>
          <p className="mt-1 text-[14px] text-muted">
            El perfil deja de mostrarse públicamente, pero conservas todos los datos. Puedes reactivarlo cuando
            quieras.
          </p>
        </Card>
        <Card
          className={`cursor-pointer !p-4 ${action === 'delete' ? 'border-2 border-danger' : ''}`}
          onClick={() => {
            setAction('delete')
            setConfirmed(false)
          }}
        >
          <p className="text-[16px] font-extrabold text-ink">Eliminar (permanente)</p>
          <p className="mt-1 text-[14px] text-muted">
            Se borra el perfil, sus fotos y contactos. El tag físico vuelve a quedar disponible para activarse de
            nuevo, como si fuera nuevo.
          </p>
        </Card>
      </div>

      {action && (
        <>
          <label className="mb-5 flex items-start gap-3 rounded-card border-2 border-night/10 p-4">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-1 h-5 w-5 accent-danger"
            />
            <span className="text-[15px] text-ink">
              {action === 'delete'
                ? 'Entiendo que esta acción no se puede deshacer.'
                : 'Entiendo que el perfil dejará de ser visible públicamente hasta que lo reactive.'}
            </span>
          </label>

          <Button
            variant="danger"
            className="w-full"
            disabled={!confirmed}
            loading={action === 'delete' ? deleteMutation.isPending : deactivateMutation.isPending}
            onClick={() => (action === 'delete' ? deleteMutation.mutate() : deactivateMutation.mutate())}
          >
            {action === 'delete' ? 'Eliminar definitivamente' : 'Desactivar tag'}
          </Button>
        </>
      )}
    </Screen>
  )
}
