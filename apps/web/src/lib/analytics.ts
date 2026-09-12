import { createAnalyticsEvent, type AnalyticsEventMap, type AnalyticsEventName } from '@meperdi/analytics-events'

/**
 * Registra un evento del catálogo de analítica (sección 18). En Fase 0 solo se registra
 * en consola durante desarrollo — nunca se envían nombres, teléfonos, mensajes,
 * coordenadas ni fotos, tal como exige la especificación.
 */
export function track<Name extends AnalyticsEventName>(name: Name, payload: AnalyticsEventMap[Name]): void {
  const event = createAnalyticsEvent(name, payload)
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug('[analytics]', event.name, event.payload)
  }
}
