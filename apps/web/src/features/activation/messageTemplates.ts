import type { ItemType } from '@meperdi/domain'

/** Plantillas de mensaje público — emocionales para mascotas, prácticas para objetos (O09). */
export const MESSAGE_TEMPLATES: Record<ItemType, string[]> = {
  pet: [
    'Gracias por encontrarme. ¿Me ayudas a volver a casa?',
    'Ayúdame a regresar con mi dueño, le hago falta.',
    'Si me ves, por favor avisa — te lo voy a agradecer mucho.',
  ],
  object: [
    'Este objeto tiene alguien que lo está buscando.',
    'Contiene cosas importantes para mí. ¡Gracias por avisar!',
    'Si lo encontraste, contáctame para coordinar la devolución.',
  ],
}
