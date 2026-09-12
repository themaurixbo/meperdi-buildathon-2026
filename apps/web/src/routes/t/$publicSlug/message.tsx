import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { sendFinderMessage } from '@meperdi/api-client'
import { finderMessageSchema } from '@meperdi/validation'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { TextAreaField } from '../../../components/ui/TextField'
import { Button } from '../../../components/ui/Button'
import { useEnsureFinderReport } from '../../../features/finder/useEnsureFinderReport'
import { track } from '../../../lib/analytics'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/message')({
  component: SendMessageScreen,
})

const QUICK_REPLIES = [
  'Lo/la tengo conmigo, está a salvo.',
  'Lo vi hace poco por esta zona.',
  '¿Cómo coordinamos la devolución?',
]

/** F06 — Enviar mensaje: hasta 500 caracteres, respuestas rápidas, contacto opcional. */
function SendMessageScreen() {
  useNoIndex()
  const { publicSlug } = Route.useParams()
  const navigate = useNavigate()
  const ensureFinderReport = useEnsureFinderReport(publicSlug)
  const [body, setBody] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: async () => {
      const parsed = finderMessageSchema.safeParse({
        body,
        contactOptIn: contactPhone.length > 0,
        contactPhoneE164: contactPhone || undefined,
      })
      if (!parsed.success) {
        throw new Error(parsed.error.issues[0]?.message ?? 'Revisa tu mensaje.')
      }
      const token = await ensureFinderReport(body)
      await sendFinderMessage(token, { text: body })
    },
    onSuccess: () => {
      track('finder_action_selected', { action: 'message' })
      navigate({ to: '/t/$publicSlug/found', params: { publicSlug } })
    },
    onError: (err) => setError(err instanceof Error ? err.message : 'No pudimos enviar tu mensaje.'),
  })

  return (
    <Screen>
      <ScreenHeader title="Enviar mensaje" />
      <p className="mb-4 text-[17px] text-muted">Cuéntale al propietario lo que necesita saber.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            type="button"
            onClick={() => setBody((prev) => (prev ? `${prev} ${reply}` : reply))}
            className="rounded-pill bg-violet/10 px-3 py-1.5 text-[13px] font-semibold text-violet"
          >
            {reply}
          </button>
        ))}
      </div>

      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
      >
        <TextAreaField
          label="Tu mensaje"
          maxLength={500}
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          hint={`${body.length}/500`}
          error={error ?? undefined}
        />
        <TextAreaField
          label="Tu teléfono (opcional)"
          hint="Solo si quieres que te contacten directamente."
          value={contactPhone}
          onChange={(e) => setContactPhone(e.target.value)}
          className="min-h-0 h-[54px]"
        />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Enviar mensaje
        </Button>
      </form>
    </Screen>
  )
}
