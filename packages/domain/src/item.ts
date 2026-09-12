/**
 * Tipo de perfil — sección 7.2 (O03). Simplificado a una decisión binaria por pedido
 * directo del cliente: mascota vs. objeto. Los objetos ya no se subdividen en categorías
 * (celular, mochila, ropa, llaves...); "qué objeto es" queda como campo libre dentro de
 * `objectDetails` en vez de una selección previa, para activar más rápido.
 */
export const ITEM_TYPES = ['pet', 'object'] as const

export type ItemType = (typeof ITEM_TYPES)[number]

export const ITEM_TYPE_LABEL: Record<ItemType, string> = {
  pet: 'Mascota',
  object: 'Objeto',
}

/** Canales de contacto disponibles por prioridad — sección 7.2 (O08). */
export const CONTACT_CHANNELS = ['call', 'whatsapp', 'sms'] as const
export type ContactChannel = (typeof CONTACT_CHANNELS)[number]

export const MAX_CONTACTS_PER_ITEM = 5
