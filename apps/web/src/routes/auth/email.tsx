import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { requestEmailOtp, verifyEmailOtp } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../components/ui/Screen'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { useAuthStore } from '../../stores/authStore'

type EmailSearch = { redirectTo?: string }

export const Route = createFileRoute('/auth/email')({
  component: EmailOtpScreen,
  validateSearch: (search: Record<string, unknown>): EmailSearch => ({
    redirectTo: typeof search.redirectTo === 'string' ? search.redirectTo : undefined,
  }),
})

/** A08 — Correo/OTP: correo, código de 6 dígitos, reenviar, cambiar correo. */
function EmailOtpScreen() {
  const { redirectTo } = Route.useSearch()
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')

  const sendOtp = useMutation({
    mutationFn: () => requestEmailOtp(email),
    onSuccess: () => setStep('code'),
  })

  const verifyOtp = useMutation({
    mutationFn: () => verifyEmailOtp(email, code),
    onSuccess: (result) => {
      setSession({ userId: result.userId, displayName: result.displayName })
      navigate({ to: redirectTo ?? '/app' })
    },
  })

  return (
    <Screen>
      <ScreenHeader title="Correo" />

      {step === 'email' ? (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            sendOtp.mutate()
          }}
        >
          <p className="text-[17px] text-muted">Te enviamos un código de 6 dígitos para confirmar que eres tú.</p>
          <TextField
            label="Correo electrónico"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={sendOtp.isError ? 'No pudimos enviar el código. Revisa el correo.' : undefined}
          />
          <Button type="submit" loading={sendOtp.isPending} className="w-full">
            Enviar código
          </Button>
        </form>
      ) : (
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            verifyOtp.mutate()
          }}
        >
          <p className="text-[17px] text-muted">
            Escribe el código que enviamos a <span className="font-bold text-ink">{email}</span>.
          </p>
          <TextField
            label="Código de 6 dígitos"
            inputMode="numeric"
            maxLength={6}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            error={verifyOtp.isError ? 'El código no es válido o expiró.' : undefined}
          />
          <Button type="submit" loading={verifyOtp.isPending} className="w-full">
            Confirmar
          </Button>
          <div className="flex justify-between text-[15px] font-semibold">
            <button type="button" onClick={() => setStep('email')} className="text-violet">
              Cambiar correo
            </button>
            <button type="button" onClick={() => sendOtp.mutate()} className="text-violet">
              Reenviar código
            </button>
          </div>
        </form>
      )}
    </Screen>
  )
}
