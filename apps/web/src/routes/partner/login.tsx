import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { startPartnerLogin, verifyPartnerLogin } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../components/ui/Screen'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { usePartnerAuthStore } from '../../stores/partnerAuthStore'

export const Route = createFileRoute('/partner/login')({
  component: PartnerLoginScreen,
})

/** P01 — Acceso aliado: inicio de sesión empresarial con 2FA. */
function PartnerLoginScreen() {
  const navigate = useNavigate()
  const setSession = usePartnerAuthStore((s) => s.setSession)
  const [step, setStep] = useState<'credentials' | 'code'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const sendLogin = useMutation({
    mutationFn: () => startPartnerLogin(email, password),
    onSuccess: () => setStep('code'),
  })

  const verify = useMutation({
    mutationFn: () => verifyPartnerLogin(email, code),
    onSuccess: (result) => {
      setSession(result)
      navigate({ to: '/partner' })
    },
  })

  return (
    <div className="min-h-svh bg-night text-cream">
      <Screen>
        <ScreenHeader showBack={false} title="" trailing={<span className="w-12" />} />

        <h1 className="mb-2 text-center text-[26px] font-extrabold leading-[32px]">Portal de aliados</h1>
        <p className="mb-8 text-center text-[17px] text-cream/75">
          Acceso empresarial para validar canjes y campañas.
        </p>

        {step === 'credentials' ? (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              sendLogin.mutate()
            }}
          >
            <TextField
              label="Correo empresarial"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="!bg-white"
            />
            <TextField
              label="Contraseña"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="!bg-white"
              error={sendLogin.isError ? 'No pudimos validar tus credenciales.' : undefined}
            />
            <Button type="submit" loading={sendLogin.isPending} className="w-full">
              Enviar código de verificación
            </Button>
          </form>
        ) : (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              verify.mutate()
            }}
          >
            <p className="text-[17px] text-cream/75">
              Escribe el código de 6 dígitos enviado a <span className="font-bold text-cream">{email}</span>.
            </p>
            <TextField
              label="Código de verificación"
              inputMode="numeric"
              maxLength={6}
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              className="!bg-white"
              error={verify.isError ? 'El código no es válido o expiró.' : undefined}
            />
            <Button type="submit" loading={verify.isPending} className="w-full">
              Confirmar acceso
            </Button>
            <button type="button" onClick={() => setStep('credentials')} className="text-[15px] font-semibold text-cream/75">
              Cambiar credenciales
            </button>
          </form>
        )}
      </Screen>
    </div>
  )
}
