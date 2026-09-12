import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { ShieldCheck } from 'lucide-react'
import { startAdminLogin, verifyAdminLogin } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../components/ui/Screen'
import { TextField } from '../../components/ui/TextField'
import { Button } from '../../components/ui/Button'
import { useAdminAuthStore } from '../../stores/adminAuthStore'

export const Route = createFileRoute('/admin/login')({
  component: AdminLoginScreen,
})

/** Acceso de administración: correo/contraseña internos + 2FA (control de acceso reforzado). */
function AdminLoginScreen() {
  const navigate = useNavigate()
  const setSession = useAdminAuthStore((s) => s.setSession)
  const [step, setStep] = useState<'credentials' | 'code'>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')

  const sendLogin = useMutation({
    mutationFn: () => startAdminLogin(email, password),
    onSuccess: () => setStep('code'),
  })

  const verify = useMutation({
    mutationFn: () => verifyAdminLogin(email, code),
    onSuccess: (result) => {
      setSession(result)
      navigate({ to: '/admin' })
    },
  })

  return (
    <div className="min-h-svh bg-night text-cream">
      <Screen>
        <ScreenHeader showBack={false} title="" trailing={<span className="w-12" />} />

        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-lime/15 text-lime">
            <ShieldCheck size={28} aria-hidden="true" />
          </div>
        </div>

        <h1 className="mb-2 text-center text-[26px] font-extrabold leading-[32px]">Administración</h1>
        <p className="mb-8 text-center text-[17px] text-cream/75">Acceso restringido al equipo de ME PERDÍ.</p>

        {step === 'credentials' ? (
          <form
            className="flex flex-col gap-5"
            onSubmit={(e) => {
              e.preventDefault()
              sendLogin.mutate()
            }}
          >
            <TextField
              label="Correo interno"
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
