import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Copy } from 'lucide-react'
import { transferItem } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { TextField } from '../../../../components/ui/TextField'
import { Button } from '../../../../components/ui/Button'
import { Card } from '../../../../components/ui/Card'

export const Route = createFileRoute('/app/items/$id/transfer')({
  component: TransferScreen,
})

/**
 * D12 — Transferir tag: genera un código de un solo uso para que otra cuenta lo reciba.
 * Nota: en Fase 0 no hay múltiples cuentas reales enlazadas a un tag, así que este paso
 * queda listo para que el backend real (Fase 1) valide el cambio de propietario.
 */
function TransferScreen() {
  const { id } = Route.useParams()
  const [recipientHint, setRecipientHint] = useState('')
  const [result, setResult] = useState<{ code: string; transferToken: string } | null>(null)

  const mutation = useMutation({
    mutationFn: () => transferItem(id, recipientHint),
    onSuccess: (data) => setResult(data),
  })

  if (result) {
    const url = `${window.location.origin}/transfer/${result.transferToken}`
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-5 pt-8 text-center">
        <h1 className="text-[24px] font-extrabold text-ink">Comparte esto con quien recibirá el tag</h1>
        <Card className="w-full">
          <p className="text-[13px] text-muted">Código de transferencia</p>
          <p className="text-[32px] font-extrabold tracking-widest text-ink">{result.code}</p>
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(url)}
            className="mt-2 flex items-center justify-center gap-1 text-[13px] font-bold text-violet underline"
          >
            <Copy size={14} aria-hidden="true" /> Copiar enlace {`/transfer/${result.transferToken}`}
          </button>
        </Card>
        <p className="text-[13px] text-muted">
          La otra persona debe abrir el enlace, iniciar sesión y escribir este código para completar la
          transferencia.
        </p>
      </Screen>
    )
  }

  return (
    <Screen className="pt-8">
      <ScreenHeader title="Transferir tag" />
      <p className="mb-5 text-[15px] text-muted">
        Escribe un dato de referencia (correo o nombre) de quien recibirá este tag, solo para tu registro.
      </p>
      <form
        className="flex flex-col gap-5"
        onSubmit={(e) => {
          e.preventDefault()
          mutation.mutate()
        }}
      >
        <TextField
          label="Referencia del destinatario"
          placeholder="Ej: maria@correo.com"
          required
          value={recipientHint}
          onChange={(e) => setRecipientHint(e.target.value)}
        />
        <Button type="submit" loading={mutation.isPending} className="w-full">
          Generar código de transferencia
        </Button>
      </form>
    </Screen>
  )
}
