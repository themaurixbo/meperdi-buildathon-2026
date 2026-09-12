import type { PublicContact } from '@meperdi/api-client'
import { MessageCircle, MessageSquareText, Phone } from 'lucide-react'
import { Card } from '../../components/ui/Card'
import { track } from '../../lib/analytics'

function waLink(phoneE164: string) {
  return `https://wa.me/${phoneE164.replace('+', '')}`
}

/** F07 — Contactar: lista priorizada, Llamar/WhatsApp/SMS, horarios visibles. */
export function ContactActions({ contacts }: { contacts: PublicContact[] }) {
  if (contacts.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-[15px] font-bold uppercase tracking-wide text-muted">Elige la forma más rápida de avisar</h2>
      {contacts.map((contact) => (
        <Card key={contact.id} className="flex items-center justify-between gap-3 !p-4">
          <div className="min-w-0">
            <p className="truncate text-[17px] font-bold text-ink">{contact.label}</p>
            {contact.schedule && <p className="text-[13px] text-muted">{contact.schedule}</p>}
          </div>
          <div className="flex shrink-0 gap-2">
            {contact.channels.includes('call') && (
              <a
                href={`tel:${contact.phoneE164}`}
                onClick={() => track('finder_action_selected', { action: 'call' })}
                aria-label={`Llamar a ${contact.label}`}
                className="flex h-12 w-12 items-center justify-center rounded-button bg-violet text-white"
              >
                <Phone size={20} aria-hidden="true" />
              </a>
            )}
            {contact.channels.includes('whatsapp') && (
              <a
                href={waLink(contact.phoneE164)}
                target="_blank"
                rel="noreferrer"
                onClick={() => track('finder_action_selected', { action: 'whatsapp' })}
                aria-label={`Escribir por WhatsApp a ${contact.label}`}
                className="flex h-12 w-12 items-center justify-center rounded-button bg-aqua text-[#0b3b32]"
              >
                <MessageCircle size={20} aria-hidden="true" />
              </a>
            )}
            {contact.channels.includes('sms') && (
              <a
                href={`sms:${contact.phoneE164}`}
                aria-label={`Enviar SMS a ${contact.label}`}
                className="flex h-12 w-12 items-center justify-center rounded-button bg-night/5 text-ink"
              >
                <MessageSquareText size={20} aria-hidden="true" />
              </a>
            )}
          </div>
        </Card>
      ))}
    </div>
  )
}
