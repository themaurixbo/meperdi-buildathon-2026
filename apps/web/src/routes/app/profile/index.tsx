import { useState } from 'react'
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { Bell, Download, HelpCircle, Laptop, LogOut, Smartphone, Trash2, User } from 'lucide-react'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Card } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { useAuthStore } from '../../../stores/authStore'
import { summarizeUserAgent } from '../../../lib/deviceInfo'

export const Route = createFileRoute('/app/profile/')({
  component: ProfileScreen,
})

/** D14 — Perfil y seguridad: métodos de acceso, sesiones, exportar datos, eliminar cuenta. */
function ProfileScreen() {
  const session = useAuthStore((s) => s.session)
  const signOut = useAuthStore((s) => s.signOut)
  const navigate = useNavigate()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function exportData() {
    const payload = {
      user: session,
      exportedAt: new Date().toISOString(),
      note: 'Exportación de ejemplo — en Fase 1 incluirá tags, avisos y devoluciones desde el backend real.',
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'meperdi-mis-datos.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title="Perfil" showBack={false} />

      <Card className="mb-5 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-violet/10">
          <User size={26} className="text-violet" aria-hidden="true" />
        </div>
        <div>
          <p className="text-[17px] font-extrabold text-ink">{session?.displayName ?? 'Invitado'}</p>
          <p className="text-[13px] text-muted">Cuenta verificada</p>
        </div>
      </Card>

      <Link to="/app/profile/notifications" className="mb-3 block">
        <Card className="flex items-center gap-3 !py-4">
          <Bell size={20} className="text-muted" aria-hidden="true" />
          <span className="text-[17px] font-semibold text-ink">Notificaciones</span>
        </Card>
      </Link>

      <Link to="/help" className="mb-5 block">
        <Card className="flex items-center gap-3 !py-4">
          <HelpCircle size={20} className="text-muted" aria-hidden="true" />
          <span className="text-[17px] font-semibold text-ink">Ayuda</span>
        </Card>
      </Link>

      <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Métodos de acceso</p>
      <Card className="mb-5 flex items-center justify-between !py-4">
        <span className="text-[15px] text-ink">Cuenta vinculada</span>
        <span className="text-[15px] font-bold text-violet">Conectada</span>
      </Card>

      <p className="mb-2 text-[13px] font-bold uppercase tracking-wide text-muted">Sesiones activas</p>
      <div className="mb-5 space-y-2">
        <Card className="flex items-center gap-3 !py-3">
          <Smartphone size={18} className="text-muted" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-semibold text-ink">{summarizeUserAgent(navigator.userAgent)}</p>
            <p className="text-[12px] text-muted">Este dispositivo — activa ahora</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 !py-3 opacity-60">
          <Laptop size={18} className="text-muted" aria-hidden="true" />
          <div>
            <p className="text-[15px] font-semibold text-ink">Otro dispositivo</p>
            <p className="text-[12px] text-muted">Sin actividad reciente</p>
          </div>
        </Card>
      </div>

      <Button variant="secondary" className="mb-8 w-full" onClick={exportData}>
        <Download size={20} aria-hidden="true" /> Exportar mis datos
      </Button>

      <Button
        variant="ghost"
        className="mb-3 w-full !text-danger"
        onClick={() => {
          signOut()
          navigate({ to: '/' })
        }}
      >
        <LogOut size={20} aria-hidden="true" /> Cerrar sesión
      </Button>

      {!confirmDelete ? (
        <button
          type="button"
          onClick={() => setConfirmDelete(true)}
          className="flex w-full items-center justify-center gap-2 text-[14px] font-semibold text-muted underline"
        >
          <Trash2 size={14} aria-hidden="true" /> Eliminar cuenta
        </button>
      ) : (
        <Card className="border-2 border-danger/30 bg-danger/5">
          <p className="mb-3 text-[14px] text-ink">
            Se eliminará tu cuenta y el acceso a tus tags. Esta acción no se puede deshacer.
          </p>
          <div className="flex gap-2">
            <Button variant="secondary" size="compact" className="flex-1" onClick={() => setConfirmDelete(false)}>
              Cancelar
            </Button>
            <Button
              variant="danger"
              size="compact"
              className="flex-1"
              onClick={() => {
                signOut()
                navigate({ to: '/' })
              }}
            >
              Sí, eliminar
            </Button>
          </div>
        </Card>
      )}
    </Screen>
  )
}
