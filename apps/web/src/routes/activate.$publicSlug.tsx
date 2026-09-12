import { useEffect, useState } from 'react'
import { createFileRoute, Link, redirect } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { PartyPopper, Plus, X } from 'lucide-react'
import { activateTag, createItem, patchItem } from '@meperdi/api-client'
import { activationPinSchema, itemIdentitySchema } from '@meperdi/validation'
import { MAX_CONTACTS_PER_ITEM } from '@meperdi/domain'
import { useAuthStore } from '../stores/authStore'
import { useAppProgressStore } from '../stores/appProgressStore'
import { emptyDraft, useActivationWizardStore, type ActivationContact } from '../stores/activationWizardStore'
import { WizardShell } from '../features/activation/WizardShell'
import { MESSAGE_TEMPLATES } from '../features/activation/messageTemplates'
import { CameraCapture } from '../features/camera/CameraCapture'
import { TextField, TextAreaField } from '../components/ui/TextField'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { PhotoFrame } from '../components/ui/PhotoFrame'
import { ItemDetails } from '../features/finder/ItemDetails'
import type { ActivationStep } from '../features/activation/steps'
import { ACTIVATION_STEPS, stepIndex } from '../features/activation/steps'

export const Route = createFileRoute('/activate/$publicSlug')({
  beforeLoad: ({ location }) => {
    if (!useAuthStore.getState().session) {
      throw redirect({ to: '/auth', search: { redirectTo: location.pathname } })
    }
  },
  component: ActivationWizardScreen,
})

function ActivationWizardScreen() {
  const { publicSlug } = Route.useParams()
  const storedDraft = useActivationWizardStore((s) => s.drafts[publicSlug])
  const updateDraft = useActivationWizardStore((s) => s.updateDraft)
  const draft = storedDraft ?? emptyDraft(publicSlug)
  const [step, setStep] = useState<ActivationStep>(draft.pinVerified ? (draft.itemId ? 'identity' : 'type') : 'pin')
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState<string | null>(null)
  const isPet = draft.itemType === 'pet'
  const markActivatedTag = useAppProgressStore((s) => s.markActivatedTag)

  useEffect(() => {
    if (step === 'success') markActivatedTag()
  }, [step, markActivatedTag])

  function patch(p: Partial<typeof draft>) {
    updateDraft(publicSlug, p)
  }

  function goTo(next: ActivationStep) {
    setStep(next)
  }

  function goBackStep() {
    const idx = stepIndex(step)
    if (idx > 0) setStep(ACTIVATION_STEPS[idx - 1]!)
  }

  const activatePinMutation = useMutation({
    mutationFn: () => {
      const parsed = activationPinSchema.parse({ pin })
      return activateTag(publicSlug, parsed.pin)
    },
    onSuccess: () => {
      patch({ pinVerified: true })
      goTo('type')
    },
    onError: (err) => {
      setPinError(err instanceof Error ? err.message : 'El PIN no es correcto.')
    },
  })

  const createItemMutation = useMutation({
    mutationFn: async () => {
      const parsed = itemIdentitySchema.parse({ name: draft.name })
      return createItem({ tagPublicSlug: publicSlug, itemType: draft.itemType!, name: parsed.name })
    },
    onSuccess: (result) => {
      patch({ itemId: result.itemId })
      goTo('details')
    },
  })

  const saveDetailsMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      if (!draft.itemId) return
      await patchItem(draft.itemId, payload)
    },
  })

  if (step === 'pin') {
    return (
      <WizardShell
        step={step}
        title="Activar tag"
        onBack={undefined}
        onNext={() => {
          setPinError(null)
          activatePinMutation.mutate()
        }}
        nextDisabled={pin.length < 6}
        nextLoading={activatePinMutation.isPending}
      >
        <p className="mb-5 text-[17px] text-muted">
          Escribe el PIN privado que viene impreso en tu tag o bajo la zona raspable del empaque.
        </p>
        <TextField
          label="PIN privado (6-10 caracteres)"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          inputMode="text"
          maxLength={10}
          autoFocus
          error={pinError ?? undefined}
        />
      </WizardShell>
    )
  }

  if (step === 'type') {
    return (
      <WizardShell step={step} title="¿Qué vas a proteger?" onBack={goBackStep} hideFooter>
        <p className="mb-5 text-[17px] text-muted">¿Es una mascota o un objeto?</p>
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              patch({ itemType: 'pet' })
              goTo('photo')
            }}
            className="flex items-center gap-4 rounded-card border-2 border-night/10 p-5 text-left active:border-violet"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-violet/10 text-[32px]">
              🐾
            </span>
            <span>
              <span className="block text-[19px] font-extrabold text-ink">Mascota</span>
              <span className="block text-[14px] text-muted">Un perro, gato u otro animal con dueño.</span>
            </span>
          </button>
          <button
            type="button"
            onClick={() => {
              patch({ itemType: 'object' })
              goTo('photo')
            }}
            className="flex items-center gap-4 rounded-card border-2 border-night/10 p-5 text-left active:border-violet"
          >
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-card bg-aqua/15 text-[32px]">
              🎒
            </span>
            <span>
              <span className="block text-[19px] font-extrabold text-ink">Objeto</span>
              <span className="block text-[14px] text-muted">Celular, mochila, llaves, ropa u otra cosa.</span>
            </span>
          </button>
        </div>
      </WizardShell>
    )
  }

  if (step === 'photo') {
    return (
      <WizardShell step={step} title="Fotos" onBack={goBackStep} onNext={() => goTo('identity')}>
        <p className="mb-5 text-[17px] text-muted">
          {isPet ? 'Una foto ayuda a que la reconozcan al instante.' : 'Una foto ayuda a identificarlo al instante.'}{' '}
          Puedes añadirla después.
        </p>

        <p className="mb-2 text-[15px] font-bold text-ink">Foto de perfil</p>
        <p className="mb-3 text-[13px] text-muted">Se mostrará grande y en redondo cuando escaneen el tag.</p>
        <div className="mb-3 flex justify-center">
          <PhotoFrame src={draft.pendingPhotoUrl ?? null} alt="Vista previa" className="h-36 w-36 rounded-full" />
        </div>
        <CameraCapture onCapture={(dataUrl) => patch({ pendingPhotoUrl: dataUrl })} />

        <div className="mt-8 border-t border-night/10 pt-6">
          <p className="mb-1 text-[15px] font-bold text-ink">Fotos de apoyo (opcional)</p>
          <p className="mb-3 text-[13px] text-muted">
            Agrega más ángulos o detalles distintivos. Se van sumando una por una.
          </p>
          {draft.pendingSupportPhotoUrls.length > 0 && (
            <div className="mb-3 flex flex-wrap gap-3">
              {draft.pendingSupportPhotoUrls.map((url, i) => (
                <div key={i} className="relative h-20 w-20">
                  <img src={url} alt="" className="h-full w-full rounded-field object-cover" />
                  <button
                    type="button"
                    aria-label="Quitar foto"
                    onClick={() =>
                      patch({ pendingSupportPhotoUrls: draft.pendingSupportPhotoUrls.filter((_, idx) => idx !== i) })
                    }
                    className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <CameraCapture
            compact
            onCapture={(dataUrl) => patch({ pendingSupportPhotoUrls: [...draft.pendingSupportPhotoUrls, dataUrl] })}
          />
        </div>
      </WizardShell>
    )
  }

  if (step === 'identity') {
    return (
      <WizardShell
        step={step}
        title="Identidad básica"
        onBack={goBackStep}
        onNext={() => createItemMutation.mutate()}
        nextDisabled={draft.name.trim().length === 0}
        nextLoading={createItemMutation.isPending}
      >
        <TextField
          label="Nombre o apodo"
          value={draft.name}
          onChange={(e) => patch({ name: e.target.value })}
          maxLength={40}
          autoFocus
        />
      </WizardShell>
    )
  }

  if (step === 'details') {
    return (
      <WizardShell
        step={step}
        title="Datos útiles"
        onBack={goBackStep}
        onNext={() => {
          const payload = isPet
            ? { petDetails: { species: draft.petSpecies || 'No especificado', breed: draft.petBreed, color: draft.petColor, sex: draft.petSex ?? 'unknown', ageText: draft.petAgeText } }
            : { objectDetails: { whatIsIt: draft.objectWhatIsIt || 'No especificado', brand: draft.objectBrand, color: draft.objectColor, distinctiveTrait: draft.objectDistinctiveTrait } }
          saveDetailsMutation.mutate(payload, { onSuccess: () => goTo('care') })
        }}
        nextLoading={saveDetailsMutation.isPending}
      >
        {isPet ? (
          <div className="flex flex-col gap-4">
            <TextField label="Especie" placeholder="Perro, gato…" value={draft.petSpecies ?? ''} onChange={(e) => patch({ petSpecies: e.target.value })} />
            <TextField label="Raza aproximada" value={draft.petBreed ?? ''} onChange={(e) => patch({ petBreed: e.target.value })} />
            <TextField label="Color" value={draft.petColor ?? ''} onChange={(e) => patch({ petColor: e.target.value })} />
            <TextField label="Edad aproximada" value={draft.petAgeText ?? ''} onChange={(e) => patch({ petAgeText: e.target.value })} />
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <TextField label="¿Qué objeto es?" placeholder="Mochila, celular, llaves…" value={draft.objectWhatIsIt ?? ''} onChange={(e) => patch({ objectWhatIsIt: e.target.value })} />
            <TextField label="Marca (opcional)" value={draft.objectBrand ?? ''} onChange={(e) => patch({ objectBrand: e.target.value })} />
            <TextField label="Color" value={draft.objectColor ?? ''} onChange={(e) => patch({ objectColor: e.target.value })} />
            <TextField
              label="¿Qué lo distingue? (opcional)"
              placeholder="Una calcomanía, un rayón, una funda…"
              value={draft.objectDistinctiveTrait ?? ''}
              onChange={(e) => patch({ objectDistinctiveTrait: e.target.value })}
            />
          </div>
        )}
      </WizardShell>
    )
  }

  if (step === 'care') {
    return (
      <WizardShell
        step={step}
        title="Cuidados e instrucciones"
        onBack={goBackStep}
        onNext={() => goTo('contacts')}
      >
        <TextAreaField
          label="Instrucciones para quien lo encuentre (opcional)"
          hint={isPet ? 'Ej: "No acercar a otros perros" o "Es alérgica a ciertos alimentos".' : 'Ej: "El celular está bloqueado" o "No abrir el compartimento delantero".'}
          value={draft.careNotes ?? ''}
          onChange={(e) => patch({ careNotes: e.target.value })}
          maxLength={280}
        />
      </WizardShell>
    )
  }

  if (step === 'contacts') {
    return (
      <WizardShell
        step={step}
        title="Contactos"
        onBack={goBackStep}
        onNext={() => goTo('message')}
        nextDisabled={draft.contacts.length === 0}
      >
        <ContactsStep contacts={draft.contacts} onChange={(contacts) => patch({ contacts })} />
      </WizardShell>
    )
  }

  if (step === 'message') {
    return (
      <WizardShell
        step={step}
        title="Mensaje público"
        onBack={goBackStep}
        onNext={() => {
          saveDetailsMutation.mutate(
            {
              publicMessage: draft.publicMessage,
              contacts: draft.contacts.map((c, i) => ({ ...c, priority: i + 1, visiblePublicly: c.visiblePublicly })),
              photoUrl: draft.pendingPhotoUrl ?? null,
              supportPhotoUrls: draft.pendingSupportPhotoUrls,
              lostReport: null,
            },
            { onSuccess: () => goTo('preview') },
          )
        }}
        nextLoading={saveDetailsMutation.isPending}
      >
        <TextAreaField
          label={isPet ? 'Mensaje para quien te encuentre' : 'Mensaje para quien lo encuentre'}
          value={draft.publicMessage}
          onChange={(e) => patch({ publicMessage: e.target.value })}
          maxLength={280}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {MESSAGE_TEMPLATES[draft.itemType ?? 'pet'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => patch({ publicMessage: t })}
              className="rounded-pill bg-violet/10 px-3 py-1.5 text-[13px] font-semibold text-violet"
            >
              {t}
            </button>
          ))}
        </div>
      </WizardShell>
    )
  }

  if (step === 'preview') {
    return (
      <WizardShell step={step} title="Vista previa" onBack={goBackStep} onNext={() => goTo('consent')}>
        <p className="mb-4 text-[17px] text-muted">Así lo verá quien escanee tu tag.</p>
        <Card className="space-y-3 text-center">
          <PhotoFrame src={draft.pendingPhotoUrl ?? null} alt={draft.name} className="mx-auto h-32 w-32 rounded-full" />
          <p className="text-[22px] font-extrabold text-ink">{draft.name}</p>
          {draft.publicMessage && <p className="text-[15px] text-muted">{draft.publicMessage}</p>}
          {draft.pendingSupportPhotoUrls.length > 0 && (
            <div className="flex justify-center gap-2 pt-2">
              {draft.pendingSupportPhotoUrls.map((url, i) => (
                <img key={i} src={url} alt="" className="h-14 w-14 rounded-field object-cover" />
              ))}
            </div>
          )}
        </Card>
        {draft.itemType && (
          <div className="mt-4">
            <ItemDetails
              profile={{
                publicSlug,
                tagStatus: 'ACTIVE',
                itemType: draft.itemType,
                name: draft.name,
                photoUrl: draft.pendingPhotoUrl ?? null,
                supportPhotoUrls: draft.pendingSupportPhotoUrls,
                publicMessage: draft.publicMessage || null,
                petDetails:
                  isPet
                    ? { species: draft.petSpecies || '—', breed: draft.petBreed, color: draft.petColor, sex: draft.petSex ?? 'unknown', ageText: draft.petAgeText }
                    : null,
                objectDetails:
                  !isPet
                    ? { whatIsIt: draft.objectWhatIsIt || '—', brand: draft.objectBrand, color: draft.objectColor, distinctiveTrait: draft.objectDistinctiveTrait }
                    : null,
                contacts: [],
                lostReport: null,
              }}
            />
          </div>
        )}
      </WizardShell>
    )
  }

  if (step === 'consent') {
    return (
      <WizardShell
        step={step}
        title="Confirmar"
        onBack={goBackStep}
        onNext={() => goTo('success')}
        nextDisabled={!draft.consentAccepted}
      >
        <label className="flex items-start gap-3 rounded-card border-2 border-night/10 p-4">
          <input
            type="checkbox"
            checked={draft.consentAccepted}
            onChange={(e) => patch({ consentAccepted: e.target.checked })}
            className="mt-1 h-5 w-5 accent-violet"
          />
          <span className="text-[15px] text-ink">
            Acepto los Términos, la Política de privacidad y confirmo qué contactos serán visibles públicamente.
          </span>
        </label>
      </WizardShell>
    )
  }

  // success (O12)
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 px-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-card bg-lime/25">
        <PartyPopper size={44} className="text-[#4b5400]" aria-hidden="true" />
      </div>
      <h1 className="text-[32px] font-extrabold text-ink">¡Tag activado!</h1>
      <p className="max-w-xs text-[17px] text-muted">{draft.name} ya tiene un hogar digital seguro.</p>
      <div className="flex w-full flex-col gap-3">
        <Button asChild className="w-full">
          <Link to="/t/$publicSlug" params={{ publicSlug }}>
            Ver perfil
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/scan">
            <Plus size={20} aria-hidden="true" /> Agregar otro tag
          </Link>
        </Button>
      </div>
    </div>
  )
}

function ContactsStep({
  contacts,
  onChange,
}: {
  contacts: ActivationContact[]
  onChange: (contacts: ActivationContact[]) => void
}) {
  const [label, setLabel] = useState('')
  const [phone, setPhone] = useState('')

  function addContact() {
    if (!label || !phone || contacts.length >= MAX_CONTACTS_PER_ITEM) return
    onChange([
      ...contacts,
      { id: crypto.randomUUID(), label, phoneE164: phone, channels: ['call', 'whatsapp'], visiblePublicly: true },
    ])
    setLabel('')
    setPhone('')
  }

  return (
    <div className="space-y-4">
      {contacts.map((c) => (
        <Card key={c.id} className="flex items-center justify-between !p-3">
          <div>
            <p className="text-[15px] font-bold text-ink">{c.label}</p>
            <p className="text-[13px] text-muted">{c.phoneE164}</p>
          </div>
          <button
            type="button"
            className="text-[13px] font-bold text-danger"
            onClick={() => onChange(contacts.filter((x) => x.id !== c.id))}
          >
            Quitar
          </button>
        </Card>
      ))}

      {contacts.length < MAX_CONTACTS_PER_ITEM && (
        <div className="space-y-3 rounded-card border-2 border-dashed border-night/15 p-4">
          <TextField label="Nombre corto" value={label} onChange={(e) => setLabel(e.target.value)} />
          <TextField label="Teléfono (+591…)" value={phone} onChange={(e) => setPhone(e.target.value)} />
          <Button type="button" variant="secondary" className="w-full" onClick={addContact}>
            Añadir contacto
          </Button>
        </div>
      )}
    </div>
  )
}
