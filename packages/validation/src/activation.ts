import { z } from 'zod'
import { ITEM_TYPES } from '@meperdi/domain'

/** PIN privado de activación — sección 7.2 (O02): 6 a 10 caracteres. */
export const activationPinSchema = z.object({
  pin: z
    .string()
    .min(6, 'El PIN debe tener al menos 6 caracteres.')
    .max(10, 'El PIN debe tener máximo 10 caracteres.'),
})

export type ActivationPinInput = z.infer<typeof activationPinSchema>

export const itemTypeSchema = z.enum(ITEM_TYPES)
