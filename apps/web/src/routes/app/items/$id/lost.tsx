import { useEffect, useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createLostReport, getMyItem } from '@meperdi/api-client'
import { lostReportSchema } from '@meperdi/validation'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { TextAreaField, TextField } from '../../../../components/ui/TextField'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'

export const Route = createFileRoute('/app/items/$id/lost')({
  component: DeclareLostScreen,
})

/** D05/D06 — Declarar pérdida (o actualizar el reporte si ya está activo). */
function DeclareLostScreen() {
  const { id } = Route.useParams()
  const navigate = useNavigate()
  const item = useQuery({ queryKey: ['owner-item', id], queryFn: () => getMyItem(id) })
  const isUpdate = item.data?.tagStatus === 'LOST'
  const [areaText, setAreaText] = useState('')
  const [circumstances, setCircumstances] = useState('')
  const [instructions, setInstructions] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (item.data?.lostReport) {
      setAreaText(item.data.lostReport.areaText)
      setCircumstances(item.data.lostReport.circumstances ?? '')
      setInstructions(item.data.lostReport.instructions ?? '')
    }
  }, [item.data])

  const mutation = useMutation({
    mutationFn: () => {
      const parsed = lostReportSchema.parse({
        lostAt: new Date().toISOString(),
        areaText,
        circumstances: circumstances || undefined,
        instructions: instructions || undefined,
      })
      return createLostReport(id, parsed)
    },
    onSuccess: () => navigate({ to: '/app/items/$id', params: { id } }),
    onError: (err) => setError(err instanceof Error ? err.message : 'Revisa los datos.'),
  })

  return (
    <Screen className="pt-8">
      <ScreenHeader title={isUpdate ? 'Actualizar pérdida' : 'Declarar pérdida'} />

      {!isUpdate && (
        <Card className="mb-5 bg-coral/5 text-[15px] text-[#b0165a]">
          Esto activará el estado <strong>ME PERDÍ</strong> en el perfil público, con mayor urgencia visual.
        </Card>
      )}

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
      >
        <TextField
          label="Zona aproximada"
          placeholder="Ej: Barrio Las Palmas, cerca del mercado"
          required
          value={areaText}
          onChange={(e) => setAreaText(e.target.value)}
        />
        <TextAreaField
          label="Circunstancias (opcional)"
          value={circumstances}
          onChange={(e) => setCircumstances(e.target.value)}
          maxLength={400}
        />
        <TextAreaField
          label="Instrucciones para quien lo encuentre (opcional)"
          value={instructions}
          onChange={(e) => setInstructions(e.target.value)}
          maxLength={280}
        />
        {error && (
          <p role="alert" className="text-[15px] font-semibold text-danger">
            {error}
          </p>
        )}
        <Button type="submit" variant="danger" loading={mutation.isPending} className="w-full">
          {isUpdate ? 'Guardar cambios' : 'Confirmar pérdida'}
        </Button>
      </form>
    </Screen>
  )
}
