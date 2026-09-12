import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Eye, EyeOff, Trash2 } from 'lucide-react'
import { getMyItem, patchItem } from '@meperdi/api-client'
import { MAX_CONTACTS_PER_ITEM, type ContactChannel } from '@meperdi/domain'
import type { OwnerContact } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { Card } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { TextField } from '../../../../components/ui/TextField'
import { CardSkeleton, ErrorState } from '../../../../components/ui/StateViews'

export const Route = createFileRoute('/app/items/$id/contacts')({
  component: ContactsScreen,
})

const CHANNEL_LABEL: Record<ContactChannel, string> = { call: 'Llamada', whatsapp: 'WhatsApp', sms: 'SMS' }

/** D09 — Contactos: agregar, editar, ordenar por prioridad, canal y visibilidad. */
function ContactsScreen() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['owner-item', id], queryFn: () => getMyItem(id) })
  const [contacts, setContacts] = useState<OwnerContact[]>([])
  const [label, setLabel] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (query.data) setContacts(query.data.contacts)
  }, [query.data])

  const save = useMutation({
    mutationFn: (next: OwnerContact[]) =>
      patchItem(id, { contacts: next.map((c, i) => ({ ...c, priority: i + 1 })) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['owner-item', id] }),
  })

  function commit(next: OwnerContact[]) {
    setContacts(next)
    save.mutate(next)
  }

  function move(index: number, delta: number) {
    const target = index + delta
    if (target < 0 || target >= contacts.length) return
    const next = [...contacts]
    ;[next[index], next[target]] = [next[target]!, next[index]!]
    commit(next)
  }

  function toggleChannel(index: number, channel: ContactChannel) {
    const next = contacts.map((c, i) => {
      if (i !== index) return c
      const has = c.channels.includes(channel)
      return { ...c, channels: has ? c.channels.filter((ch) => ch !== channel) : [...c.channels, channel] }
    })
    commit(next)
  }

  function toggleVisibility(index: number) {
    const next = contacts.map((c, i) => (i === index ? { ...c, visiblePublicly: !c.visiblePublicly } : c))
    commit(next)
  }

  function removeContact(index: number) {
    commit(contacts.filter((_, i) => i !== index))
  }

  function addContact() {
    if (!label || !phone || contacts.length >= MAX_CONTACTS_PER_ITEM) return
    commit([
      ...contacts,
      { id: crypto.randomUUID(), label, phoneE164: phone, channels: ['call', 'whatsapp'], priority: contacts.length + 1, visiblePublicly: true },
    ])
    setLabel('')
    setPhone('')
  }

  if (query.isPending) {
    return (
      <Screen className="pt-8">
        <CardSkeleton />
      </Screen>
    )
  }

  if (query.isError) {
    return (
      <Screen className="pt-8">
        <ErrorState title="No pudimos cargar los contactos" onRetry={() => query.refetch()} />
      </Screen>
    )
  }

  return (
    <Screen className="pb-10 pt-8">
      <ScreenHeader title="Contactos" />
      <p className="mb-4 text-[15px] text-muted">
        El orden define la prioridad de aviso. Hasta {MAX_CONTACTS_PER_ITEM} contactos.
      </p>

      <div className="space-y-3">
        {contacts.map((c, i) => (
          <Card key={c.id} className="!p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[16px] font-extrabold text-ink">{c.label}</p>
                <p className="text-[13px] text-muted">{c.phoneE164}</p>
              </div>
              <div className="flex gap-1">
                <button
                  type="button"
                  aria-label="Subir prioridad"
                  disabled={i === 0}
                  onClick={() => move(i, -1)}
                  className="flex h-8 w-8 items-center justify-center rounded-button bg-night/5 text-ink disabled:opacity-30"
                >
                  <ArrowUp size={16} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  aria-label="Bajar prioridad"
                  disabled={i === contacts.length - 1}
                  onClick={() => move(i, 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-button bg-night/5 text-ink disabled:opacity-30"
                >
                  <ArrowDown size={16} aria-hidden="true" />
                </button>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              {(['call', 'whatsapp', 'sms'] as const).map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(i, channel)}
                  className={`rounded-pill px-3 py-1 text-[13px] font-bold ${
                    c.channels.includes(channel) ? 'bg-violet text-white' : 'bg-night/5 text-muted'
                  }`}
                >
                  {CHANNEL_LABEL[channel]}
                </button>
              ))}
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-night/5 pt-3">
              <button
                type="button"
                onClick={() => toggleVisibility(i)}
                className="flex items-center gap-1.5 text-[13px] font-bold text-muted"
              >
                {c.visiblePublicly ? <Eye size={16} aria-hidden="true" /> : <EyeOff size={16} aria-hidden="true" />}
                {c.visiblePublicly ? 'Visible públicamente' : 'Oculto del público'}
              </button>
              <button
                type="button"
                onClick={() => removeContact(i)}
                aria-label="Quitar contacto"
                className="flex h-8 w-8 items-center justify-center rounded-button bg-danger/10 text-danger"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          </Card>
        ))}
      </div>

      {contacts.length < MAX_CONTACTS_PER_ITEM && (
        <div className="mt-4 space-y-3 rounded-card border-2 border-dashed border-night/15 p-4">
          <TextField label="Nombre corto" value={label} onChange={(e) => setLabel(e.target.value)} />
          <TextField label="Teléfono (+591…)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="button" variant="secondary" className="w-full" onClick={addContact}>
            Añadir contacto
          </Button>
        </div>
      )}
    </Screen>
  )
}
