import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Gift, QrCode } from 'lucide-react'
import { confirmRedemption, validateRedemption } from '@meperdi/api-client'
import { Screen } from '../../components/ui/Screen'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'

export const Route = createFileRoute('/partner/')({
  component: ValidateRedemptionScreen,
})

/** P02 — Validar gift token: escanear/escribir código, ver beneficio y confirmar canje. */
function ValidateRedemptionScreen() {
  const [code, setCode] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  const validate = useMutation({
    mutationFn: () => validateRedemption(code.trim()),
    onSuccess: () => setConfirmed(false),
  })

  const confirm = useMutation({
    mutationFn: () => confirmRedemption(code.trim(), validate.data?.partnerLocationId ?? ''),
    onSuccess: () => setConfirmed(true),
  })

  const result = validate.data

  return (
    <Screen className="pt-6">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-button bg-violet/10 text-violet">
          <Gift size={22} aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-[22px] font-extrabold text-ink">Validar canje</h1>
          <p className="text-[15px] text-muted">Escribe o escanea el código del gift token del finder.</p>
        </div>
      </div>

      <form
        className="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault()
          validate.mutate()
        }}
      >
        <TextField
          label="Código de canje"
          required
          value={code}
          onChange={(e) => {
            setCode(e.target.value.toUpperCase())
            validate.reset()
            setConfirmed(false)
          }}
          trailing={<QrCode size={20} className="text-muted" aria-hidden="true" />}
        />
        <Button type="submit" loading={validate.isPending} className="w-full">
          Validar código
        </Button>
      </form>

      {validate.isError && (
        <p role="alert" className="mt-4 text-[15px] font-semibold text-danger">
          No pudimos validar el código. Inténtalo de nuevo.
        </p>
      )}

      {result && !result.valid && (
        <Card className="mt-5 border-2 border-danger/30">
          <p className="text-[17px] font-bold text-danger">Código no válido</p>
          <p className="mt-1 text-[15px] text-muted">Revisa que esté completo o pide al finder que lo vuelva a mostrar.</p>
        </Card>
      )}

      {result?.valid && !confirmed && (
        <Card className="mt-5">
          <p className="text-[13px] font-semibold text-muted">Beneficio</p>
          <p className="mt-1 text-[19px] font-extrabold text-ink">{result.benefit}</p>
          {result.expiresAt && (
            <p className="mt-1 text-[15px] text-muted">
              Vence el {new Date(result.expiresAt).toLocaleDateString('es-BO', { day: '2-digit', month: 'long', year: 'numeric' })}
            </p>
          )}
          <Button
            className="mt-4 w-full"
            loading={confirm.isPending}
            onClick={() => confirm.mutate()}
          >
            Confirmar canje
          </Button>
        </Card>
      )}

      {confirmed && (
        <Card className="mt-5 border-2 border-aqua/40 bg-aqua/10 text-center">
          <CheckCircle2 size={32} className="mx-auto text-aqua" aria-hidden="true" />
          <p className="mt-2 text-[19px] font-extrabold text-ink">Canje confirmado</p>
          <p className="mt-1 text-[15px] text-muted">Quedó registrado en tu historial de redenciones.</p>
        </Card>
      )}
    </Screen>
  )
}
