import { useEffect } from 'react'

/**
 * Evita la indexación de perfiles de tags — sección 14 (privacidad).
 * Los perfiles son enlaces "de posesión" (quien tiene el tag físico), no contenido público
 * para buscadores.
 */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => {
      document.head.removeChild(meta)
    }
  }, [])
}
