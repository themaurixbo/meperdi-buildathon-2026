import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AlertTriangle, ArrowRightLeft, Eye, History, Share2, Trash2, Users, X } from 'lucide-react'
import { getMyItem, patchItem } from '@meperdi/api-client'
import { Screen, ScreenHeader } from '../../../../components/ui/Screen'
import { Card } from '../../../../components/ui/Card'
import { Button } from '../../../../components/ui/Button'
import { PhotoFrame } from '../../../../components/ui/PhotoFrame'
import { TagStatusBadge } from '../../../../components/ui/TagStatusBadge'
import { TextAreaField } from '../../../../components/ui/TextField'
import { CardSkeleton, ErrorState } from '../../../../components/ui/StateViews'
import { ItemDetails } from '../../../../features/finder/ItemDetails'
import { ReturnCoordinationCard } from '../../../../features/owner/ReturnCoordinationCard'
import { LostActiveCard } from '../../../../features/owner/LostActiveCard'
import { CameraCapture } from '../../../../features/camera/CameraCapture'

export const Route = createFileRoute('/app/items/$id/')({
  component: ItemDetailScreen,
})

/** D03/D04 — Detalle del tag y edición por secciones (autosave del mensaje público). */
function ItemDetailScreen() {
  const { id } = Route.useParams()
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['owner-item', id], queryFn: () => getMyItem(id) })
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (query.data) setMessage(query.data.publicMessage ?? '')
  }, [query.data])

  function invalidate() {
    return queryClient.invalidateQueries({ queryKey: ['owner-item', id] })
  }

  const saveMessage = useMutation({
    mutationFn: (publicMessage: string) => patchItem(id, { publicMessage }),
    onSuccess: invalidate,
  })

  const saveProfilePhoto = useMutation({
    mutationFn: (photoUrl: string) => patchItem(id, { photoUrl }),
    onSuccess: invalidate,
  })

  const addSupportPhoto = useMutation({
    mutationFn: (dataUrl: string) => {
      const current = query.data?.supportPhotoUrls ?? []
      return patchItem(id, { supportPhotoUrls: [...current, dataUrl] })
    },
    onSuccess: invalidate,
  })

  const removeSupportPhoto = useMutation({
    mutationFn: (index: number) => {
      const current = query.data?.supportPhotoUrls ?? []
      return patchItem(id, { supportPhotoUrls: current.filter((_, i) => i !== index) })
    },
    onSuccess: invalidate,
  })

  if (query.isPending) {
    return (
      <Screen className="pt-8">
        <CardSkeleton />
      </Screen>
    )
  }

  if (query.isError || !query.data) {
    return (
      <Screen className="pt-8">
        <ErrorState title="No pudimos cargar este tag" onRetry={() => query.refetch()} />
      </Screen>
    )
  }

  const item = query.data

  return (
    <Screen className="pb-4 pt-8">
      <ScreenHeader title={item.name} />

      <div className="mb-5 flex flex-col items-center text-center">
        <PhotoFrame src={item.photoUrl} alt={item.name} className="h-36 w-36 rounded-full" />
        <div className="mt-3">
          <TagStatusBadge status={item.tagStatus} />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Button asChild variant="secondary" className="w-full">
          <Link to="/t/$publicSlug" params={{ publicSlug: item.publicSlug }}>
            <Eye size={20} aria-hidden="true" /> Ver público
          </Link>
        </Button>
        <Button
          variant="secondary"
          className="w-full"
          onClick={() => navigator.clipboard?.writeText(`${window.location.origin}/t/${item.publicSlug}`)}
        >
          <Share2 size={20} aria-hidden="true" /> Compartir
        </Button>
      </div>

      <Button asChild variant="secondary" className="mb-5 w-full">
        <Link to="/app/items/$id/activity" params={{ id }}>
          <History size={20} aria-hidden="true" /> Ver historial de actividad
        </Link>
      </Button>

      {item.tagStatus === 'ACTIVE' && (
        <Link
          to="/app/items/$id/lost"
          params={{ id }}
          className="mb-5 flex items-center gap-2 rounded-card bg-coral/10 p-4 text-[15px] font-bold text-[#b0165a]"
        >
          <AlertTriangle size={20} aria-hidden="true" /> Declarar pérdida
        </Link>
      )}

      {item.tagStatus === 'LOST' && (
        <div className="mb-5">
          <LostActiveCard itemId={id} itemName={item.name} publicSlug={item.publicSlug} />
        </div>
      )}

      {(item.tagStatus === 'LOST' || item.tagStatus === 'RETURN_PENDING') && (
        <div className="mb-5">
          <ReturnCoordinationCard itemId={id} />
        </div>
      )}

      <Card className="mb-5">
        <p className="mb-2 text-[15px] font-bold text-ink">Foto de perfil</p>
        <CameraCapture compact onCapture={(dataUrl) => saveProfilePhoto.mutate(dataUrl)} />
      </Card>

      <Card className="mb-5">
        <p className="mb-1 text-[15px] font-bold text-ink">Fotos de apoyo</p>
        <p className="mb-3 text-[13px] text-muted">Se muestran debajo de la foto de perfil en el enlace público.</p>
        {item.supportPhotoUrls.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-3">
            {item.supportPhotoUrls.map((url, i) => (
              <div key={i} className="relative h-20 w-20">
                <img src={url} alt="" className="h-full w-full rounded-field object-cover" />
                <button
                  type="button"
                  aria-label="Quitar foto"
                  onClick={() => removeSupportPhoto.mutate(i)}
                  className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        )}
        <CameraCapture compact onCapture={(dataUrl) => addSupportPhoto.mutate(dataUrl)} />
      </Card>

      <Card className="mb-5">
        <TextAreaField
          label="Mensaje público"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={280}
        />
        <Button
          size="compact"
          className="mt-3"
          loading={saveMessage.isPending}
          onClick={() => saveMessage.mutate(message)}
        >
          Guardar
        </Button>
      </Card>

      <Button asChild variant="secondary" className="mb-3 w-full">
        <Link to="/app/items/$id/contacts" params={{ id }}>
          <Users size={20} aria-hidden="true" /> Contactos
        </Link>
      </Button>

      <ItemDetails profile={item} />

      <div className="mt-6 space-y-3 border-t border-night/10 pt-6">
        <Button asChild variant="ghost" className="w-full">
          <Link to="/app/items/$id/transfer" params={{ id }}>
            <ArrowRightLeft size={18} aria-hidden="true" /> Transferir tag
          </Link>
        </Button>
        <Button asChild variant="ghost" className="w-full !text-danger">
          <Link to="/app/items/$id/delete" params={{ id }}>
            <Trash2 size={18} aria-hidden="true" /> Eliminar o desactivar
          </Link>
        </Button>
      </div>
    </Screen>
  )
}
