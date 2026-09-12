import { z } from 'zod'

/** Aviso del finder — sección 7.4 (F06): hasta 500 caracteres, foto y contacto opcionales. */
export const finderMessageSchema = z.object({
  body: z.string().trim().min(1, 'Escribe un mensaje breve.').max(500, 'Máximo 500 caracteres.'),
  contactOptIn: z.boolean().default(false),
  contactPhoneE164: z.string().optional(),
})

/**
 * Ubicación compartida por el finder — sección 7.4 (F04/F05).
 * Solo se envía después de tocar el botón de consentimiento explícito.
 */
export const locationConsentSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().nonnegative(),
  consentGiven: z.literal(true, {
    message: 'Se necesita tu consentimiento explícito para compartir la ubicación.',
  }),
  /** Obligatoria solo si el marcador se movió del punto detectado por el GPS. */
  note: z.string().trim().max(200).optional(),
})

/** Reporte de problema — sección 7.4 (F11). */
export const reportIssueSchema = z.object({
  reason: z.enum(['damaged_tag', 'incorrect_content', 'possible_fraud', 'risk_situation']),
  details: z.string().trim().max(500).optional(),
})

export type FinderMessageInput = z.infer<typeof finderMessageSchema>
export type LocationConsentInput = z.infer<typeof locationConsentSchema>
export type ReportIssueInput = z.infer<typeof reportIssueSchema>
