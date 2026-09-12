import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useDevScenarioStore, type NetworkCondition } from './devScenario'
import { cn } from '../lib/cn'

const NETWORK_OPTIONS: Array<{ value: NetworkCondition; label: string }> = [
  { value: 'normal', label: 'Normal' },
  { value: 'slow', label: 'Lento' },
  { value: 'error', label: 'Error' },
  { value: 'offline', label: 'Sin conexión' },
]

const DEMO_TAGS: Array<{ slug: string; label: string }> = [
  { slug: 'sin-activar-001', label: 'UNCLAIMED — sin activar' },
  { slug: 'activa-luna', label: 'ACTIVE — Luna (mascota)' },
  { slug: 'perdida-nala', label: 'LOST — Nala (mascota)' },
  { slug: 'devolucion-max', label: 'RETURN_PENDING — Max' },
  { slug: 'en-casa-rocky', label: 'RETURNED — Rocky' },
  { slug: 'suspendido-demo', label: 'SUSPENDED' },
  { slug: 'inactivo-demo', label: 'DEACTIVATED' },
  { slug: 'activo-celular-joel', label: 'ACTIVE — celular' },
  { slug: 'activo-mochila-vale', label: 'ACTIVE — mochila' },
  { slug: 'nombre-largo-demo', label: 'ACTIVE — nombre largo / 5 contactos' },
]

/** Selector de escenario visible solo en desarrollo — sección 21. */
export function DevScenarioPanel() {
  const [open, setOpen] = useState(false)
  const { networkCondition, setNetworkCondition } = useDevScenarioStore()

  return (
    <div className="fixed bottom-3 right-3 z-[999] font-sans text-sm">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="rounded-pill bg-night px-4 py-2 font-bold text-cream shadow-card"
      >
        {open ? 'Cerrar' : 'Escenarios'} {networkCondition !== 'normal' && `· ${networkCondition}`}
      </button>

      {open && (
        <div className="mt-2 max-h-[70vh] w-72 overflow-y-auto rounded-card border border-night/10 bg-white p-4 shadow-card">
          <p className="mb-2 font-bold text-ink">Condición de red</p>
          <div className="mb-4 flex flex-wrap gap-2">
            {NETWORK_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setNetworkCondition(opt.value)}
                className={cn(
                  'rounded-pill px-3 py-1 text-xs font-bold',
                  networkCondition === opt.value ? 'bg-violet text-white' : 'bg-cream text-muted',
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <p className="mb-2 font-bold text-ink">Tags de prueba</p>
          <ul className="space-y-1">
            {DEMO_TAGS.map((tag) => (
              <li key={tag.slug}>
                <Link
                  to="/t/$publicSlug"
                  params={{ publicSlug: tag.slug }}
                  className="block rounded-field px-2 py-1 text-xs text-ink hover:bg-cream"
                  onClick={() => setOpen(false)}
                >
                  {tag.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
