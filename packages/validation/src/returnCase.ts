import { z } from 'zod'

/** Código de entrega de un solo uso — sección 7.5 (R04) y 8.3. */
export const handoffCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, 'El código tiene 6 dígitos.')
    .regex(/^\d{6}$/, 'El código solo contiene números.'),
})

export const lostReportSchema = z.object({
  lostAt: z.string().datetime(),
  areaText: z.string().trim().min(1, 'Cuéntanos la zona aproximada.').max(120),
  circumstances: z.string().trim().max(400).optional(),
  instructions: z.string().trim().max(280).optional(),
})

export type HandoffCodeInput = z.infer<typeof handoffCodeSchema>
export type LostReportInput = z.infer<typeof lostReportSchema>
