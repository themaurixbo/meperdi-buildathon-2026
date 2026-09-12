import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers, Plus, X } from 'lucide-react'
import { createTagBatch, listTagBatches } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextField } from '../../components/ui/TextField'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/batches')({
  component: TagBatchesScreen,
})

const STATUS_LABEL: Record<string, string> = { printing: 'Imprimiendo', printed: 'Impreso', shipped: 'Enviado' }
const EMPTY_FORM = { label: '', quantity: '', publicSlugPrefix: '' }

/** AD02 — Lotes de tags: crear/importar lote, generar publicSlug + PIN, estado e impresión. */
function TagBatchesScreen() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const query = useQuery({ queryKey: ['admin-batches'], queryFn: listTagBatches })

  const create = useMutation({
    mutationFn: () => createTagBatch({ label: form.label, quantity: Number(form.quantity) || 0, publicSlugPrefix: form.publicSlugPrefix }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-batches'] })
      setForm(EMPTY_FORM)
      setShowForm(false)
    },
  })

  return (
    <div>
      <AdminPageHeader icon={Layers} title="Lotes de tags" description="Crear/importar lote, publicSlug + PIN, estado e impresión." />

      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-button bg-violet px-4 py-2 text-[14px] font-bold text-white"
        >
          {showForm ? <X size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          {showForm ? 'Cerrar' : 'Nuevo lote'}
        </button>
      </div>

      {showForm && (
        <Card className="mb-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              create.mutate()
            }}
          >
            <TextField label="Nombre del lote" required value={form.label} onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Cantidad" type="number" min={1} required value={form.quantity} onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))} />
              <TextField
                label="Prefijo publicSlug"
                required
                placeholder="mp-eq"
                value={form.publicSlugPrefix}
                onChange={(e) => setForm((f) => ({ ...f, publicSlugPrefix: e.target.value }))}
              />
            </div>
            <Button type="submit" loading={create.isPending} className="w-full">
              Generar lote
            </Button>
          </form>
        </Card>
      )}

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((batch) => (
          <Card key={batch.id} className="flex items-center justify-between">
            <div>
              <p className="text-[16px] font-extrabold text-ink">{batch.label}</p>
              <p className="text-[13px] text-muted">
                {batch.quantity} unidades · prefijo {batch.publicSlugPrefix}- ·{' '}
                {new Date(batch.createdAt).toLocaleDateString('es-BO', { dateStyle: 'medium' })}
              </p>
            </div>
            <span className="whitespace-nowrap rounded-pill bg-night/5 px-3 py-1 text-[13px] font-bold text-ink">
              {STATUS_LABEL[batch.status]}
            </span>
          </Card>
        ))}
      </div>
    </div>
  )
}
