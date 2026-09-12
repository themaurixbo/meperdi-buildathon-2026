import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { reportIssueSchema, type ReportIssueInput } from '@meperdi/validation'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { TextAreaField } from '../../../components/ui/TextField'
import { Button } from '../../../components/ui/Button'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/report-issue')({
  component: ReportIssueScreen,
})

const REASONS: Array<{ value: ReportIssueInput['reason']; label: string }> = [
  { value: 'damaged_tag', label: 'El tag está dañado' },
  { value: 'incorrect_content', label: 'El contenido parece incorrecto' },
  { value: 'possible_fraud', label: 'Posible fraude' },
  { value: 'risk_situation', label: 'Situación de riesgo' },
]

/**
 * F11 — Reportar problema. Nota de implementación: la sección 12 del contrato de API
 * todavía no define un endpoint para reportes de abuso/daño; se simula localmente
 * y queda pendiente añadir `POST /api/public/tags/:slug/issue-reports` en Fase 1.
 */
function ReportIssueScreen() {
  useNoIndex()
  const [reason, setReason] = useState<ReportIssueInput['reason']>('damaged_tag')
  const [details, setDetails] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      reportIssueSchema.parse({ reason, details: details || undefined })
      await new Promise((resolve) => setTimeout(resolve, 500))
    },
  })

  if (mutation.isSuccess) {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 size={44} className="text-[#0b6b58]" aria-hidden="true" />
        <h1 className="text-[24px] font-extrabold text-ink">Gracias por avisarnos</h1>
        <p className="max-w-xs text-[17px] text-muted">Nuestro equipo va a revisar este reporte.</p>
      </Screen>
    )
  }

  return (
    <Screen>
      <ScreenHeader title="Reportar un problema" />
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <fieldset className="space-y-2">
          <legend className="mb-1.5 text-[15px] font-semibold text-ink">¿Qué está pasando?</legend>
          {REASONS.map((r) => (
            <label
              key={r.value}
              className="flex items-center gap-3 rounded-field border-2 border-night/10 p-3 text-[17px] text-ink has-[:checked]:border-violet"
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="h-5 w-5 accent-violet"
              />
              {r.label}
            </label>
          ))}
        </fieldset>

        <TextAreaField
          label="Detalles (opcional)"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
        />

        <Button type="submit" loading={mutation.isPending} className="w-full">
          Enviar reporte
        </Button>
      </form>
    </Screen>
  )
}
