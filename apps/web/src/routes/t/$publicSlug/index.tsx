import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { HandHeart, Home, MapPin, MessageSquare, ShieldQuestion } from 'lucide-react'
import { createFinderReport } from '@meperdi/api-client'
import { useTagPublicProfile } from '../../../features/finder/useTagPublicProfile'
import { ItemDetails } from '../../../features/finder/ItemDetails'
import { ContactActions } from '../../../features/finder/ContactActions'
import { PhotoGallery } from '../../../features/finder/PhotoGallery'
import { PhotoLightbox, usePhotoLightbox } from '../../../features/finder/PhotoLightbox'
import { PhotoFrame } from '../../../components/ui/PhotoFrame'
import { TagStatusBadge } from '../../../components/ui/TagStatusBadge'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Screen } from '../../../components/ui/Screen'
import { CardSkeleton, ErrorState } from '../../../components/ui/StateViews'
import { useAuthStore } from '../../../stores/authStore'
import { useFinderReportStore } from '../../../stores/finderReportStore'
import { useNoIndex } from '../../../lib/useNoIndex'

export const Route = createFileRoute('/t/$publicSlug/')({
  component: TagProfileScreen,
})

function TagProfileScreen() {
  useNoIndex()
  const { publicSlug } = Route.useParams()
  const query = useTagPublicProfile(publicSlug)
  const navigate = useNavigate()
  const session = useAuthStore((s) => s.session)
  const saveReport = useFinderReportStore((s) => s.saveReport)
  const lightbox = usePhotoLightbox()

  const reportMutation = useMutation({
    mutationFn: () => createFinderReport(publicSlug, { contactOptIn: false }),
    onSuccess: (result) => {
      saveReport(publicSlug, result)
      navigate({ to: '/t/$publicSlug/found', params: { publicSlug } })
    },
  })

  if (query.isPending) {
    return (
      <Screen className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
      </Screen>
    )
  }

  if (query.isError) {
    const notFound = (query.error as { code?: string })?.code === 'tag_not_found'
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center">
        <ErrorState
          title={notFound ? 'No encontramos este tag' : 'No pudimos cargar este perfil'}
          description={
            notFound
              ? 'Revisa el código o el enlace que escaneaste.'
              : 'Verifica tu conexión e inténtalo de nuevo.'
          }
          onRetry={() => query.refetch()}
        />
      </Screen>
    )
  }

  const profile = query.data
  const { tagStatus } = profile

  if (tagStatus === 'UNCLAIMED') {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-5 text-center">
        <div className="flex h-24 w-24 items-center justify-center rounded-card bg-violet/10">
          <ShieldQuestion size={40} className="text-violet" aria-hidden="true" />
        </div>
        <h1 className="text-[28px] font-extrabold text-ink">Este tag está listo para tener dueño.</h1>
        <p className="max-w-xs text-[17px] text-muted">
          Si es tuyo, actívalo con tu cuenta y el PIN privado que viene con tu tag.
        </p>
        <Button
          className="w-full"
          onClick={() =>
            navigate({
              to: session ? '/activate/$publicSlug' : '/auth',
              params: session ? { publicSlug } : undefined,
              search: session ? undefined : { redirectTo: `/activate/${publicSlug}` },
            })
          }
        >
          Soy el propietario
        </Button>
      </Screen>
    )
  }

  if (tagStatus === 'SUSPENDED' || tagStatus === 'DEACTIVATED') {
    return (
      <Screen className="flex min-h-svh flex-col items-center justify-center gap-4 text-center">
        <TagStatusBadge status={tagStatus} />
        <h1 className="text-[24px] font-extrabold text-ink">Este tag no está disponible por ahora.</h1>
        <p className="max-w-xs text-[17px] text-muted">
          No podemos mostrar información pública de este perfil. Si necesitas ayuda, contáctanos.
        </p>
        <Button asChild variant="secondary">
          <Link to="/help">Ir a soporte</Link>
        </Button>
      </Screen>
    )
  }

  const allPhotos = [profile.photoUrl, ...profile.supportPhotoUrls].filter((url): url is string => Boolean(url))

  return (
    <Screen className="space-y-5">
      <Link
        to={session ? '/app' : '/'}
        aria-label="Ir al inicio"
        className="flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-card"
      >
        <Home size={20} className="text-ink" aria-hidden="true" />
      </Link>

      <div className="text-center">
        {profile.photoUrl ? (
          <button type="button" onClick={() => lightbox.open(0)} aria-label="Ver foto en grande">
            <PhotoFrame
              src={profile.photoUrl}
              alt={profile.name ?? ''}
              className="mx-auto h-60 w-60 max-w-full rounded-full"
            />
          </button>
        ) : (
          <PhotoFrame src={null} alt={profile.name ?? ''} className="mx-auto h-60 w-60 max-w-full rounded-full" />
        )}
        <div className="mt-4 flex justify-center">
          <TagStatusBadge status={tagStatus} />
        </div>
        <h1 className="mt-2 text-[28px] font-extrabold leading-[34px] text-ink">
          {tagStatus === 'LOST' && profile.itemType === 'pet' ? `Soy ${profile.name}.` : profile.name}
        </h1>
        {profile.publicMessage && <p className="mt-2 text-[17px] text-muted">{profile.publicMessage}</p>}
        {profile.supportPhotoUrls.length > 0 && (
          <div className="mt-4">
            <PhotoGallery
              photoUrls={profile.supportPhotoUrls}
              onOpen={(i) => lightbox.open(profile.photoUrl ? i + 1 : i)}
            />
          </div>
        )}
      </div>

      {lightbox.openIndex !== null && (
        <PhotoLightbox
          photos={allPhotos}
          index={lightbox.openIndex}
          onClose={lightbox.close}
          onIndexChange={lightbox.open}
        />
      )}

      {tagStatus === 'LOST' && profile.lostReport && (
        <Card className="border-2 border-coral/30 bg-coral/5">
          <p className="text-[15px] font-bold text-[#b0165a]">Última vez visto</p>
          <p className="mt-1 text-[17px] text-ink">{profile.lostReport.areaText}</p>
          {profile.lostReport.instructions && (
            <p className="mt-2 text-[15px] text-muted">{profile.lostReport.instructions}</p>
          )}
        </Card>
      )}

      {tagStatus === 'RETURN_PENDING' && (
        <Card className="bg-violet/5 text-[15px] font-semibold text-violet">
          Ya hay una devolución en curso para este tag. ¡Gracias por tu interés en ayudar!
        </Card>
      )}

      {(tagStatus === 'ACTIVE' || tagStatus === 'LOST') && (
        <Button
          className="w-full"
          variant={tagStatus === 'LOST' ? 'primary' : 'secondary'}
          loading={reportMutation.isPending}
          onClick={() => reportMutation.mutate()}
        >
          <HandHeart size={20} aria-hidden="true" /> Avisar que estoy aquí
        </Button>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="w-full">
          <Link to="/t/$publicSlug/location" params={{ publicSlug }}>
            <MapPin size={20} aria-hidden="true" /> Ubicación
          </Link>
        </Button>
        <Button asChild variant="secondary" className="w-full">
          <Link to="/t/$publicSlug/message" params={{ publicSlug }}>
            <MessageSquare size={20} aria-hidden="true" /> Mensaje
          </Link>
        </Button>
      </div>

      <ItemDetails profile={profile} />
      <ContactActions contacts={profile.contacts} />

      <Card className="bg-night/5 text-[15px] text-muted">
        Ayudar no significa ponerte en riesgo.{' '}
        <Link to="/t/$publicSlug/safety" params={{ publicSlug }} className="font-bold text-violet underline">
          Ver consejos de seguridad
        </Link>
      </Card>

      <Link
        to="/t/$publicSlug/report-issue"
        params={{ publicSlug }}
        className="block text-center text-[15px] font-semibold text-muted underline"
      >
        Reportar un problema con este tag
      </Link>
    </Screen>
  )
}
