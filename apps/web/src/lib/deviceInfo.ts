/**
 * Información del dispositivo que el navegador expone sin pedir ningún permiso —
 * nunca cámara, ubicación ni notificaciones. Se registra en cada escaneo para el
 * historial de actividad del propietario (sección 11, entidad `scans`).
 */
export interface DeviceInfo {
  userAgent: string
  language: string
  timeZone: string
  screen: string
  referrer?: string
}

export function collectDeviceInfo(): DeviceInfo {
  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screen: `${window.screen.width}x${window.screen.height}`,
    referrer: document.referrer || undefined,
  }
}

/** Resume un user-agent crudo en algo legible, ej. "Chrome · Android". */
export function summarizeUserAgent(userAgent: string): string {
  const browser = /Edg\//.test(userAgent)
    ? 'Edge'
    : /Chrome\//.test(userAgent)
      ? 'Chrome'
      : /Firefox\//.test(userAgent)
        ? 'Firefox'
        : /Safari\//.test(userAgent) && !/Chrome/.test(userAgent)
          ? 'Safari'
          : 'Navegador'

  const os = /Android/.test(userAgent)
    ? 'Android'
    : /iPhone|iPad|iPod/.test(userAgent)
      ? 'iOS'
      : /Windows/.test(userAgent)
        ? 'Windows'
        : /Mac OS X/.test(userAgent)
          ? 'Mac'
          : /Linux/.test(userAgent)
            ? 'Linux'
            : 'Dispositivo'

  return `${browser} · ${os}`
}

/**
 * IP pública aproximada, obtenida del lado del cliente sin ningún permiso del navegador
 * (solo una petición de red, invisible para la persona). Es una aproximación de Fase 0:
 * en el backend real (Fase 1) la IP se lee del request en el servidor, que es la fuente
 * correcta y no depende de un tercero.
 */
export async function tryGetPublicIp(): Promise<string | null> {
  try {
    const response = await fetch('https://api.ipify.org?format=json', {
      signal: AbortSignal.timeout(3000),
    })
    if (!response.ok) return null
    const data = (await response.json()) as { ip?: string }
    return data.ip ?? null
  } catch {
    return null
  }
}
