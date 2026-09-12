export const ACTIVATION_STEPS = [
  'pin',
  'type',
  'photo',
  'identity',
  'details',
  'care',
  'contacts',
  'message',
  'preview',
  'consent',
  'success',
] as const

export type ActivationStep = (typeof ACTIVATION_STEPS)[number]

export function stepIndex(step: ActivationStep): number {
  return ACTIVATION_STEPS.indexOf(step)
}
