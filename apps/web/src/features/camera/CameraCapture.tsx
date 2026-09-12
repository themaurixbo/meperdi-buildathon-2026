import { useRef } from 'react'
import { Camera, Circle, Images, X } from 'lucide-react'
import { useCameraCapture } from './useCameraCapture'
import { Button } from '../../components/ui/Button'

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}

/** Selector de foto: cámara en vivo (con obturador) o galería, a elección del usuario. */
export function CameraCapture({ onCapture, compact }: { onCapture: (dataUrl: string) => void; compact?: boolean }) {
  const { videoRef, state, start, stop, capture } = useCameraCapture()
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    onCapture(await readFileAsDataUrl(file))
  }

  function handleShutter() {
    const dataUrl = capture()
    if (dataUrl) onCapture(dataUrl)
  }

  if (state === 'live' || state === 'starting') {
    return (
      <div className="relative aspect-square w-full overflow-hidden rounded-card bg-night">
        <video ref={videoRef} className="h-full w-full object-cover" muted playsInline />
        {state === 'starting' && (
          <div className="absolute inset-0 flex items-center justify-center text-cream">Iniciando cámara…</div>
        )}
        <button
          type="button"
          onClick={stop}
          aria-label="Cancelar"
          className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-night/60 text-cream"
        >
          <X size={20} aria-hidden="true" />
        </button>
        {state === 'live' && (
          <button
            type="button"
            onClick={handleShutter}
            aria-label="Tomar foto"
            className="absolute bottom-4 left-1/2 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full bg-white"
          >
            <Circle size={48} strokeWidth={1.5} className="text-night" aria-hidden="true" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div className={compact ? 'flex gap-2' : 'flex flex-col gap-2'}>
      {state === 'denied' && (
        <p className="text-[13px] font-semibold text-danger">
          No pudimos acceder a tu cámara. Revisa los permisos o elige una foto de tu galería.
        </p>
      )}
      {state === 'error' && (
        <p className="text-[13px] font-semibold text-danger">No pudimos iniciar la cámara. Intenta con la galería.</p>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="secondary" size="compact" onClick={start} className="flex-1">
          <Camera size={18} aria-hidden="true" /> Tomar foto
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="compact"
          onClick={() => fileInputRef.current?.click()}
          className="flex-1"
        >
          <Images size={18} aria-hidden="true" /> Galería
        </Button>
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="sr-only" onChange={handleFile} />
    </div>
  )
}
