import type { TagPublicProfile } from '@meperdi/api-client'
import { Card } from '../../components/ui/Card'

const SEX_LABEL: Record<string, string> = { female: 'Hembra', male: 'Macho', unknown: 'No indicado' }

export function ItemDetails({ profile }: { profile: TagPublicProfile }) {
  if (profile.petDetails) {
    const d = profile.petDetails
    return (
      <Card className="space-y-2">
        <DetailRow label="Especie" value={d.species} />
        {d.breed && <DetailRow label="Raza" value={d.breed} />}
        {d.color && <DetailRow label="Color" value={d.color} />}
        <DetailRow label="Sexo" value={SEX_LABEL[d.sex] ?? d.sex} />
        {d.ageText && <DetailRow label="Edad aproximada" value={d.ageText} />}
        {d.temperament && <DetailRow label="Temperamento" value={d.temperament} />}
        {d.urgentCare && (
          <div className="mt-2 rounded-field bg-coral/10 p-3 text-[15px] font-semibold text-[#b0165a]">
            ⚠ {d.urgentCare}
          </div>
        )}
      </Card>
    )
  }

  if (profile.objectDetails) {
    const d = profile.objectDetails
    return (
      <Card className="space-y-2">
        <DetailRow label="Qué es" value={d.whatIsIt} />
        {d.brand && <DetailRow label="Marca" value={d.brand} />}
        {d.color && <DetailRow label="Color" value={d.color} />}
        {d.distinctiveTrait && <DetailRow label="Se distingue por" value={d.distinctiveTrait} />}
      </Card>
    )
  }

  return null
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 text-[15px]">
      <span className="text-muted">{label}</span>
      <span className="text-right font-semibold text-ink">{value}</span>
    </div>
  )
}
