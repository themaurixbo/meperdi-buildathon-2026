/** Galería de fotos de apoyo — se muestran debajo de la foto de perfil (sección 7.4). Clic para ampliar. */
export function PhotoGallery({ photoUrls, onOpen }: { photoUrls: string[]; onOpen: (index: number) => void }) {
  if (photoUrls.length === 0) return null

  return (
    <div className="-mx-5 flex gap-3 overflow-x-auto px-5 pb-1">
      {photoUrls.map((url, i) => (
        <button
          key={i}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`Ver foto ${i + 1} en grande`}
          className="shrink-0"
        >
          <img src={url} alt="" className="h-24 w-24 rounded-card object-cover shadow-card" />
        </button>
      ))}
    </div>
  )
}
