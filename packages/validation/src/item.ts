import { z } from 'zod'

/** Identidad básica — sección 7.2 (O05). */
export const itemIdentitySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Escribe un nombre o apodo.')
    .max(40, 'Máximo 40 caracteres.'),
})

/** Datos útiles de mascota — sección 10.1. Todo opcional salvo la especie. */
export const petDetailsSchema = z.object({
  species: z.string().trim().min(1, 'Indica la especie.').max(40),
  breed: z.string().trim().max(60).optional(),
  color: z.string().trim().max(60).optional(),
  sex: z.enum(['female', 'male', 'unknown']).default('unknown'),
  ageText: z.string().trim().max(40).optional(),
  temperament: z.string().trim().max(280).optional(),
  urgentCare: z.string().trim().max(280).optional(),
})

/**
 * Datos útiles de un objeto — simplificado a pedido del cliente: qué objeto es,
 * marca, color y un rasgo distintivo. Sin categorías previas ni campos de mascota
 * (nunca "raza" para un objeto).
 */
export const objectDetailsSchema = z.object({
  whatIsIt: z.string().trim().min(1, 'Cuéntanos qué objeto es.').max(60),
  brand: z.string().trim().max(60).optional(),
  color: z.string().trim().max(60).optional(),
  distinctiveTrait: z.string().trim().max(280).optional(),
})

/** Mensaje público del propietario — sección 7.2 (O09). */
export const publicMessageSchema = z.object({
  message: z.string().trim().max(280, 'Máximo 280 caracteres.').optional(),
})

export type ItemIdentityInput = z.infer<typeof itemIdentitySchema>
export type PetDetailsInput = z.infer<typeof petDetailsSchema>
export type ObjectDetailsInput = z.infer<typeof objectDetailsSchema>
