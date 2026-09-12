import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, MapPin, PenLine } from 'lucide-react'
import { sendFinderMessage, shareFinderLocation } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../components/ui/Screen'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { TextAreaField } from '../../../components/ui/TextField'
import { LocationMap } from '../../../features/location/LocationMap'
import { useEnsureFinderReport } from '../../../features/finder/useEnsureFinderReport'
import { track } from '../../../lib/analytics'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/location')({
  component: ShareLocationScreen,
})

type Step = 'consent' | 'map' | 'manual' | 'confirmed'

/** Distancia aproximada en metros entre dos coordenadas (fórmula de Haversine). */
function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(a))
}

/** A partir de esta distancia consideramos que el marcador ya no es "tu ubicación actual". */
const MOVED_THRESHOLD_M = 60

/** F04/F05 — Compartir ubicación: consentimiento explícito, mapa real, marcador ajustable. */
function ShareLocationScreen() {
  useNoIndex()
  const { publicSlug } = Route.useParams()
  const ensureFinderReport = useEnsureFinderReport(publicSlug)
  const [step, setStep] = useState<Step>('consent')
  const [manualText, setManualText] = useState('')
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [origin, setOrigin] = useState<{ lat: number; lng: number } | null>(null)
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null)
  const [note, setNote] = useState('')

  const locateMutation = useMutation({
    mutationFn: async () => {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Este dispositivo no permite compartir ubicación.'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10_000 })
      })
      return position
    },
    onSuccess: (position) => {
      const point = { lat: position.coords.latitude, lng: position.coords.longitude }
      setOrigin(point)
      setMarker(point)
      setAccuracy(position.coords.accuracy)
      setStep('map')
    },
    onError: (err) => {
      track('permission_denied', { permission: 'location' })
      setError(err instanceof Error ? err.message : 'No pudimos obtener tu ubicación.')
    },
  })

  const moved = origin && marker ? distanceMeters(origin.lat, origin.lng, marker.lat, marker.lng) > MOVED_THRESHOLD_M : false

  const sendMutation = useMutation({
    mutationFn: async () => {
      if (!marker) return
      const token = await ensureFinderReport()
      await shareFinderLocation(token, {
        lat: marker.lat,
        lng: marker.lng,
        accuracyM: accuracy ?? 0,
        note: moved ? note.trim() : undefined,
      })
    },
    onSuccess: () => {
      track('finder_action_selected', { action: 'location' })
      setStep('confirmed')
    },
  })

  const manualMutation = useMutation({
    mutationFn: async () => {
      // No hay coordenadas exactas: se envía como referencia escrita vía mensaje protegido,
      // en vez de forzar un lat/lng inventado sobre el contrato de ubicación (sección 12).
      const token = await ensureFinderReport()
      await sendFinderMessage(token, { text: `Referencia de ubicación: ${manualText}` })
      return manualText
    },
    onSuccess: () => setStep('confirmed'),
  })

  if (step === 'confirmed') {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
        <CheckCircle2 size={48} className="text-[#0b6b58]" aria-hidden="true" />
        <h1 className="text-[28px] font-extrabold text-ink">Ubicación enviada</h1>
        <p className="max-w-xs text-[17px] text-muted">
          {accuracy
            ? `Precisión aproximada: ${Math.round(accuracy)} metros.`
            : 'Le avisamos al propietario con la referencia que escribiste.'}
        </p>
        <Button asChild className="w-full">
          <Link to="/t/$publicSlug/found" params={{ publicSlug }}>
            Continuar
          </Link>
        </Button>
      </Screen>
    )
  }

  if (step === 'map' && marker) {
    return (
      <Screen>
        <ScreenHeader title="Ajustar ubicación" onBack={() => setStep('consent')} />
        <p className="mb-3 text-[15px] text-muted">
          Arrastra el marcador o toca el mapa si necesitas ajustarlo. Solo el propietario podrá verlo.
        </p>
        <LocationMap
          lat={marker.lat}
          lng={marker.lng}
          onMove={(lat, lng) => setMarker({ lat, lng })}
          className="mb-4 h-64 w-full overflow-hidden rounded-card"
        />

        {moved ? (
          <div className="mb-4">
            <TextAreaField
              label="¿Por qué esta ubicación es distinta a la actual?"
              placeholder='Ej: "Aquí estaré en 30 minutos" o "Me estoy moviendo hacia el centro".'
              required
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={200}
            />
          </div>
        ) : (
          <Card className="mb-4 bg-aqua/10 text-[14px] text-[#0b6b58]">Esta es tu ubicación actual.</Card>
        )}

        <Button
          className="w-full"
          loading={sendMutation.isPending}
          disabled={moved && note.trim().length === 0}
          onClick={() => sendMutation.mutate()}
        >
          Enviar ubicación
        </Button>
      </Screen>
    )
  }

  if (step === 'manual') {
    return (
      <Screen>
        <ScreenHeader title="Escribir ubicación" onBack={() => setStep('consent')} />
        <form
          className="flex flex-col gap-5"
          onSubmit={(e) => {
            e.preventDefault()
            manualMutation.mutate()
          }}
        >
          <TextAreaField
            label="¿Dónde lo viste?"
            placeholder="Ej: Cerca de la plaza principal, sobre la avenida Banzer"
            required
            value={manualText}
            onChange={(e) => setManualText(e.target.value)}
          />
          <Button type="submit" loading={manualMutation.isPending} className="w-full">
            Enviar referencia
          </Button>
        </form>
      </Screen>
    )
  }

  return (
    <Screen className="flex min-h-svh flex-col items-center justify-center gap-6 text-center">
      <div className="flex h-24 w-24 items-center justify-center rounded-card bg-aqua/15">
        <MapPin size={40} className="text-[#0b6b58]" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">Comparte dónde estás.</h1>
        <p className="mt-2 max-w-xs text-[17px] text-muted">Solo el propietario podrá verlo.</p>
      </div>

      {error && (
        <Card className="w-full bg-danger/10 text-[15px] font-semibold text-danger">{error}</Card>
      )}

      <div className="flex w-full flex-col gap-3">
        <Button className="w-full" loading={locateMutation.isPending} onClick={() => locateMutation.mutate()}>
          Compartir mi ubicación
        </Button>
        <Button variant="secondary" className="w-full" onClick={() => setStep('manual')}>
          <PenLine size={20} aria-hidden="true" /> Escribir ubicación
        </Button>
      </div>
    </Screen>
  )
}
