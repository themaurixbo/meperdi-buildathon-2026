/**
 * Un tag ME PERDÍ codifica una URL corta hacia /t/:publicSlug (sección 3.4).
 * Acepta URL completa, ruta relativa o el slug suelto, para tolerar QRs de prueba
 * generados con distintas bases (localhost, dominio real, etc.).
 */
export function extractSlugFromScan(text: string): string | null {
  const trimmed = text.trim()
  if (!trimmed) return null

  let pathname = trimmed
  try {
    pathname = new URL(trimmed).pathname
  } catch {
    // No es una URL absoluta — se trata como ruta o slug suelto.
  }

  const match = pathname.match(/\/t\/([^/?#]+)/)
  if (match?.[1]) return decodeURIComponent(match[1])

  if (/^[a-zA-Z0-9-]+$/.test(trimmed)) return trimmed

  return null
}
