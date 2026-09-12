/**
 * Genera una foto de marcador de posición (SVG en data URI) para los fixtures de MSW.
 * No usamos fotografías reales: el prototipo no tiene banco de imágenes de mascotas/objetos,
 * así que representamos "tiene foto" con una ilustración suave en los colores de marca.
 */
const PALETTES: Array<[string, string]> = [
  ['#7C3AED', '#20E3C2'],
  ['#FF4D8D', '#7C3AED'],
  ['#20E3C2', '#D9FF43'],
  ['#0B1026', '#7C3AED'],
]

export function placeholderPhoto(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  const [from, to] = PALETTES[hash % PALETTES.length]!
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480" viewBox="0 0 480 480">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="480" rx="48" fill="url(#g)"/>
    <circle cx="180" cy="200" r="34" fill="#FFF8ED" opacity="0.92"/>
    <circle cx="300" cy="200" r="34" fill="#FFF8ED" opacity="0.92"/>
    <circle cx="192" cy="205" r="12" fill="#111827"/>
    <circle cx="312" cy="205" r="12" fill="#111827"/>
    <path d="M190 300 Q240 340 290 300" stroke="#FFF8ED" stroke-width="14" fill="none" stroke-linecap="round"/>
  </svg>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}
