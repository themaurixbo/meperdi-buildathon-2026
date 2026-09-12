import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

export function usePhotoLightbox() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  return {
    openIndex,
    open: (index: number) => setOpenIndex(index),
    close: () => setOpenIndex(null),
  }
}

interface PhotoLightboxProps {
  photos: string[]
  index: number
  onClose: () => void
  onIndexChange: (index: number) => void
}

/** Carrusel a pantalla completa — tocar una foto la amplía; desliza o usa las flechas para ver las demás. */
export function PhotoLightbox({ photos, index, onClose, onIndexChange }: PhotoLightboxProps) {
  const touchStartX = useRef<number | null>(null)

  function go(delta: number) {
    onIndexChange((index + delta + photos.length) % photos.length)
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-night/95"
      role="dialog"
      aria-modal="true"
      aria-label="Foto ampliada"
      onTouchStart={(e) => {
        touchStartX.current = e.touches[0]?.clientX ?? null
      }}
      onTouchEnd={(e) => {
        if (touchStartX.current === null) return
        const delta = (e.changedTouches[0]?.clientX ?? 0) - touchStartX.current
        if (Math.abs(delta) > 40) go(delta > 0 ? -1 : 1)
        touchStartX.current = null
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Cerrar"
        className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-cream"
      >
        <X size={22} aria-hidden="true" />
      </button>

      <div className="flex flex-1 items-center justify-center px-4">
        <img src={photos[index]} alt="" className="max-h-[75vh] max-w-full rounded-card object-contain" />
      </div>

      {photos.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Foto anterior"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream"
          >
            <ChevronLeft size={24} aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Foto siguiente"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-cream"
          >
            <ChevronRight size={24} aria-hidden="true" />
          </button>

          <div className="mb-8 flex justify-center gap-1.5">
            {photos.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-pill ${i === index ? 'bg-cream' : 'bg-cream/30'}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
