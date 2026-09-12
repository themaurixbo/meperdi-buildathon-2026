/**
 * ME PERDÍ — design tokens.
 * Fuente única de verdad para color, tipografía, radios, sombras y movimiento.
 * Consumido por apps/web (Tailwind @theme + componentes) y, a futuro, por apps/mobile.
 * Valores tomados literalmente de la especificación de producto, sección 3.
 */

export const colors = {
  night: '#0B1026',
  violet: '#7C3AED',
  aqua: '#20E3C2',
  coral: '#FF4D8D',
  lime: '#D9FF43',
  cream: '#FFF8ED',
  white: '#FFFFFF',
  ink: '#111827',
  muted: '#667085',
  danger: '#E5484D',
} as const

export type ColorToken = keyof typeof colors

/** Gradiente de campaña — solo para hero, onboarding y celebración, nunca para lectura. */
export const campaignGradient =
  'linear-gradient(135deg, #7C3AED 0%, #FF4D8D 55%, #20E3C2 100%)'

export const fontFamily = {
  sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
} as const

/** Escala tipográfica: tamaño/alto de línea en px y peso, sección 3.3. */
export const typeScale = {
  display: { fontSize: 40, lineHeight: 44, fontWeight: 800 },
  screenTitle: { fontSize: 32, lineHeight: 38, fontWeight: 800 },
  subtitle: { fontSize: 22, lineHeight: 28, fontWeight: 750 },
  body: { fontSize: 17, lineHeight: 26, fontWeight: 500 },
  label: { fontSize: 15, lineHeight: 22, fontWeight: 600 },
  button: { fontSize: 17, lineHeight: 20, fontWeight: 800 },
} as const

export const radii = {
  card: 24,
  field: 18,
  button: 18,
  pill: 9999,
} as const

export const touchTarget = {
  minimum: 48,
  preferred: 54,
} as const

export const iconSize = {
  action: 32,
  actionMin: 28,
  nav: 24,
} as const

/** Sombras suaves y coloreadas — nunca gris pesado, sección 3.3. */
export const shadows = {
  card: '0 12px 24px -12px rgba(11, 16, 38, 0.18)',
  violetGlow: '0 10px 30px -10px rgba(124, 58, 237, 0.45)',
  aquaGlow: '0 10px 30px -10px rgba(32, 227, 194, 0.4)',
  coralGlow: '0 10px 30px -10px rgba(255, 77, 141, 0.4)',
} as const

/** Movimiento con propósito: 180–300ms, principio 8. Respetar prefers-reduced-motion. */
export const motion = {
  durationMs: { fast: 180, base: 220, slow: 300 },
  easing: 'cubic-bezier(0.16, 1, 0.3, 1)',
} as const

export const breakpoints = {
  mobileSm: 360,
  mobileMd: 390,
  mobileLg: 430,
  tablet: 768,
  desktop: 1024,
} as const

export const tokens = {
  colors,
  campaignGradient,
  fontFamily,
  typeScale,
  radii,
  touchTarget,
  iconSize,
  shadows,
  motion,
  breakpoints,
} as const

export type DesignTokens = typeof tokens
