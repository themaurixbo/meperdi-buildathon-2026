import { HttpResponse } from 'msw'
import { useDevScenarioStore } from './devScenario'

/** Construye el sobre { data, error, meta, requestId } exigido por la sección 12. */
export function ok<T>(data: T, init?: { status?: number }) {
  return HttpResponse.json(
    { data, error: null, meta: null, requestId: crypto.randomUUID() } as { data: T; error: null; meta: null; requestId: string },
    { status: init?.status ?? 200 },
  )
}

export function fail(code: string, message: string, status = 400, fieldErrors?: Record<string, string>) {
  return HttpResponse.json(
    { data: null, error: { code, message, fieldErrors }, meta: null, requestId: crypto.randomUUID() },
    { status },
  )
}

/**
 * Aplica el escenario de red elegido en el panel de desarrollo: retraso, error forzado
 * u "offline" (nunca resuelve, deja que el Service Worker/fetch falle por su cuenta).
 * Devuelve `true` si el handler debe abortar y responder con error genérico.
 */
export async function applyDevNetworkScenario(): Promise<'continue' | 'forced-error'> {
  const { networkCondition } = useDevScenarioStore.getState()
  if (networkCondition === 'offline') {
    throw new Error('offline-scenario')
  }
  if (networkCondition === 'slow') {
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  if (networkCondition === 'error') {
    return 'forced-error'
  }
  return 'continue'
}
