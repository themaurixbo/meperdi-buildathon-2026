import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, X } from 'lucide-react'
import { createPartnerCampaign, listPartnerCampaigns } from '@meperdi/api-client'
import { Screen } from '../../components/ui/Screen'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { TextField, TextAreaField } from '../../components/ui/TextField'
import { CardSkeleton, EmptyState } from '../../components/ui/StateViews'

export const Route = createFileRoute('/partner/campaigns')({
  component: CampaignsScreen,
})

const EMPTY_FORM = { benefit: '', stock: '', validUntil: '', locations: '', rules: '' }

/** P04 — Campañas: beneficio, stock, vigencia, locales y reglas. */
function CampaignsScreen() {
  const queryClient = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)

  const query = useQuery({ queryKey: ['partner-campaigns'], queryFn: listPartnerCampaigns })

  const createCampaign = useMutation({
    mutationFn: () =>
      createPartnerCampaign({
        partnerName: query.data?.[0]?.partnerName ?? 'Mi negocio',
        benefit: form.benefit,
        stock: Number(form.stock) || 0,
        validUntil: form.validUntil,
        locations: form.locations,
        rules: form.rules,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner-campaigns'] })
      setForm(EMPTY_FORM)
      setShowForm(false)
    },
  })

  return (
    <Screen className="pt-6">
      <div className="mb-5 flex items-center justify-between">
        <h1 className="text-[22px] font-extrabold text-ink">Campañas</h1>
        <button
          type="button"
          onClick={() => setShowForm((v) => !v)}
          aria-label={showForm ? 'Cerrar' : 'Nueva campaña'}
          className="flex h-11 w-11 items-center justify-center rounded-button bg-violet text-white"
        >
          {showForm ? <X size={20} aria-hidden="true" /> : <Plus size={20} aria-hidden="true" />}
        </button>
      </div>

      {showForm && (
        <Card className="mb-5">
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault()
              createCampaign.mutate()
            }}
          >
            <TextField
              label="Beneficio"
              required
              value={form.benefit}
              onChange={(e) => setForm((f) => ({ ...f, benefit: e.target.value }))}
              placeholder="20% de descuento en consulta"
            />
            <div className="grid grid-cols-2 gap-3">
              <TextField
                label="Stock"
                type="number"
                min={0}
                required
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
              />
              <TextField
                label="Vigente hasta"
                type="date"
                required
                value={form.validUntil}
                onChange={(e) => setForm((f) => ({ ...f, validUntil: e.target.value }))}
              />
            </div>
            <TextField
              label="Locales"
              required
              value={form.locations}
              onChange={(e) => setForm((f) => ({ ...f, locations: e.target.value }))}
              placeholder="Sucursal Equipetrol, Sucursal Norte"
            />
            <TextAreaField
              label="Reglas"
              required
              value={form.rules}
              onChange={(e) => setForm((f) => ({ ...f, rules: e.target.value }))}
              placeholder="Aplica una vez por gift token, no acumulable"
            />
            <Button type="submit" loading={createCampaign.isPending} className="w-full">
              Crear campaña
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
      {query.isSuccess && query.data.length === 0 && !showForm && (
        <EmptyState title="Sin campañas" description="Crea tu primera campaña de beneficios." />
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((c) => (
          <Card key={c.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[17px] font-extrabold text-ink">{c.benefit}</p>
              <span className="whitespace-nowrap rounded-pill bg-lime/25 px-3 py-1 text-[13px] font-bold text-[#4b5400]">
                Stock {c.stock}
              </span>
            </div>
            <p className="mt-2 text-[14px] text-muted">
              Vigente hasta{' '}
              {c.validUntil
                ? new Date(c.validUntil.includes('T') ? c.validUntil : `${c.validUntil}T00:00:00`).toLocaleDateString(
                    'es-BO',
                    { dateStyle: 'medium' },
                  )
                : '—'}
            </p>
            <p className="mt-1 text-[14px] text-muted">Locales: {c.locations}</p>
            <p className="mt-2 text-[14px] text-ink">{c.rules}</p>
          </Card>
        ))}
      </div>
    </Screen>
  )
}
