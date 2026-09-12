import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { Camera, ScanLine, WifiOff } from 'lucide-react'
import { Screen, ScreenHeader } from '../components/ui/Screen'
import { TextField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { useQrCameraScanner } from '../features/scan/useQrCameraScanner'
import { extractSlugFromScan } from '../features/scan/extractSlug'

export const Route = createFileRoute('/scan')({
  component: ScanScreen,
})

const DEMO_TAGS = [
  { slug: 'activa-luna', label: 'Luna — activa' },
  { slug: 'perdida-nala', label: 'Nala — perdida' },
  { slug: 'sin-activar-001', label: 'Tag sin activar' },
]

/** /scan — Escáner QR por cámara, con entrada manual y tags de prueba como alternativa. */
function ScanScreen() {
  const navigate = useNavigate()
  const [manualSlug, setManualSlug] = useState('')
  const handledRef = useRef(false)

  const { videoRef, state, start, stop } = useQrCameraScanner((text) => {
    if (handledRef.current) return
    const slug = extractSlugFromScan(text)
    if (!slug) return
    handledRef.current = true
    stop()
    navigate({ to: '/t/$publicSlug', params: { publicSlug: slug } })
  })

  return (
    <Screen>
      <ScreenHeader title="Escanear" />

      <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-card border-2 border-dashed border-violet/40 bg-night">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          style={{ display: state === 'scanning' || state === 'starting' ? 'block' : 'none' }}
          muted
          playsInline
        />

        {state === 'idle' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-cream/80">
            <ScanLine size={48} className="text-aqua" aria-hidden="true" />
            <p className="max-w-[220px] text-center text-[15px]">Activa la cámara para escanear el QR del tag</p>
            <Button onClick={start} className="mt-2">
              <Camera size={20} aria-hidden="true" /> Activar cámara
            </Button>
          </div>
        )}

        {state === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center bg-night/60 text-cream">
            Iniciando cámara…
          </div>
        )}

        {state === 'denied' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-cream/90">
            <Camera size={36} className="text-coral" aria-hidden="true" />
            <p className="text-[15px] font-semibold">No pudimos acceder a tu cámara.</p>
            <p className="text-[13px] text-cream/70">
              Revisa los permisos de cámara de tu navegador para este sitio e inténtalo de nuevo.
            </p>
            <Button variant="secondary" size="compact" className="mt-2 !bg-white/10 !text-cream" onClick={start}>
              Reintentar
            </Button>
          </div>
        )}

        {state === 'unsupported' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-cream/90">
            <WifiOff size={36} className="text-coral" aria-hidden="true" />
            <p className="text-[15px] font-semibold">Este dispositivo no tiene una cámara disponible.</p>
            <p className="text-[13px] text-cream/70">Usa la entrada manual o los tags de prueba abajo.</p>
          </div>
        )}

        {state === 'error' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6 text-center text-cream/90">
            <p className="text-[15px] font-semibold">No pudimos iniciar el escáner.</p>
            <Button variant="secondary" size="compact" className="mt-2 !bg-white/10 !text-cream" onClick={start}>
              Reintentar
            </Button>
          </div>
        )}
      </div>

      <form
        className="mb-6 flex items-end gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          if (manualSlug.trim()) navigate({ to: '/t/$publicSlug', params: { publicSlug: manualSlug.trim() } })
        }}
      >
        <div className="flex-1">
          <TextField label="O escribe el código del tag" value={manualSlug} onChange={(e) => setManualSlug(e.target.value)} />
        </div>
        <Button type="submit">Ir</Button>
      </form>

      <p className="mb-3 text-[15px] font-bold text-muted">Tags de prueba</p>
      <div className="space-y-2">
        {DEMO_TAGS.map((tag) => (
          <Link key={tag.slug} to="/t/$publicSlug" params={{ publicSlug: tag.slug }}>
            <Card className="!p-3 text-[15px] font-semibold text-ink">{tag.label}</Card>
          </Link>
        ))}
      </div>
    </Screen>
  )
}
