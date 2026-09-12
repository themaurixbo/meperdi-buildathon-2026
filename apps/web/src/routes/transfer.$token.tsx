import { useState } from 'react'
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { acceptTransfer } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../components/ui/Screen'
import { TextField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { useAuthStore } from '../stores/authStore'

export const Route = createFileRoute('/transfer/$token')({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().session) {
      throw redirect({ to: '/auth', search: { redirectTo: location.pathname } })
    }
  },
  component: AcceptTransferScreen,
})

/** D12 (lado receptor) — confirmar la transferencia con el código de un solo uso. */
function AcceptTransferScreen() {
  const { token } = Route.useParams()
  const navigate = useNavigate()
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () => acceptTransfer(token, { code }),
    onError: () => setError('El código no es correcto.'),
  })

  if (mutation.isSuccess) {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-4 pt-8 text-center">
        <CheckCircle2 size={48} className="text-[#0b6b58]" aria-hidden="true" />
        <h1 className="text-[24px] font-extrabold text-ink">¡Tag transferido!</h1>
        <p className="max-w-xs text-[17px] text-muted">Ya puedes administrarlo desde tu cuenta.</p>
        <Button onClick={() => navigate({ to: '/app' })} className="w-full">
          Ir a mis tags
        </Button>
      </Screen>
    )
  }

  return (
    <Screen className="pt-8">
      <ScreenHeader title="Recibir tag" />
      <p className="mb-5 text-[17px] text-muted">Escribe el código de 6 dígitos que te compartió el propietario.</p>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          setError(null)
          mutation.mutate()
        }}
      >
        <TextField
          label="Código de transferencia"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
          error={error ?? undefined}
        />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Confirmar
        </Button>
      </form>
    </Screen>
  )
}
