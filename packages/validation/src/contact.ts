import { z } from 'zod'
import { CONTACT_CHANNELS, MAX_CONTACTS_PER_ITEM } from '@meperdi/domain'

const e164 = /^\+[1-9]\d{6,14}$/

/** Contacto de un item — sección 7.2 (O08), hasta 5 por perfil. */
export const contactSchema = z.object({
  label: z.string().trim().min(1, 'Ponle un nombre corto.').max(30),
  phoneE164: z.string().regex(e164, 'Usa un teléfono válido con código de país, ej. +59171234567.'),
  channels: z.array(z.enum(CONTACT_CHANNELS)).min(1, 'Elige al menos un canal.'),
  priority: z.number().int().min(1).max(MAX_CONTACTS_PER_ITEM),
  schedule: z.string().trim().max(60).optional(),
  visiblePublicly: z.boolean().default(true),
})

export const contactListSchema = z.array(contactSchema).max(MAX_CONTACTS_PER_ITEM, 'Máximo 5 contactos.')

export type ContactInput = z.infer<typeof contactSchema>
