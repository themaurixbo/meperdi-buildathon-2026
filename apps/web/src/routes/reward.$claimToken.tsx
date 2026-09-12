import { useState } from 'react'
import { createFileRoute, Link, useLocation } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Gift, Sparkles, Ticket } from 'lucide-react'
import { claimReward } from '@meperdi/api-client'
import { availableRewardKinds, REWARD_KIND_LABEL, type RewardKind } from '@meperdi/domain'
import { Screen } from '../components/ui/Screen'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { featureFlags } from '../lib/featureFlags'
import { track } from '../lib/analytics'
import { useNoIndex } from '../lib/useNoIndex'

export const Route = createFileRoute('/reward/$claimToken')({
  component: RewardClaimScreen,
})

/** R06–R10 — Devolución lograda, elegir y revelar el premio comunitario. */
function RewardClaimScreen() {
  useNoIndex()
  const { claimToken } = Route.useParams()
  const location = useLocation()
  const [revealed, setRevealed] = useState<RewardKind | null>(null)

  const kinds = availableRewardKinds({ freeDynamicEnabledInCountry: featureFlags.freeRewardDynamic, claimantIsAdult: true })

  const mutation = useMutation({
    mutationFn: (kind: RewardKind) => claimReward(claimToken, kind),
    onSuccess: (result, kind) => {
      track('reward_claimed', { rewardKind: kind })
      setRevealed(result.rewardKind ?? kind)
    },
  })

  if (revealed) {
    return <RewardRevealed claimToken={claimToken} rewardKind={revealed} redirectPath={location.pathname} />
  }

  return (
    <Screen className="pt-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-card bg-lime/25">
          <Sparkles size={36} className="text-[#4b5400]" aria-hidden="true" />
        </div>
      </div>
      <h1 className="text-[28px] font-extrabold text-ink">¡Volvió a casa!</h1>
      <p className="mt-2 text-[17px] text-muted">La comunidad quiere agradecerte.</p>

      <div className="mt-6 space-y-3">
        {kinds.map((kind) => (
          <Card key={kind} className="flex items-center justify-between !p-4 text-left">
            <div className="flex items-center gap-3">
              {kind === 'guaranteed_gift_token' ? (
                <Gift size={24} className="text-violet" aria-hidden="true" />
              ) : (
                <Ticket size={24} className="text-violet" aria-hidden="true" />
              )}
              <div>
                <p className="text-[17px] font-bold text-ink">{REWARD_KIND_LABEL[kind]}</p>
                {kind === 'free_dynamic' && <p className="text-[13px] text-muted">Gratuita, sin costo para ti</p>}
              </div>
            </div>
            <Button size="compact" loading={mutation.isPending} onClick={() => mutation.mutate(kind)}>
              Elegir
            </Button>
          </Card>
        ))}
      </div>

      <p className="mt-6 text-[13px] text-muted">
        Los aportes al fondo comunitario no otorgan ventajas para ganar y no se mezclan con esta devolución.
      </p>
    </Screen>
  )
}

const DEMO_PRIZES = ['20% de descuento en veterinaria aliada', 'Kit de bienvenida ME PERDÍ', 'Snacks para tu mascota']

function RewardRevealed({
  rewardKind,
  redirectPath,
}: {
  claimToken: string
  rewardKind: RewardKind
  redirectPath: string
}) {
  const prize = DEMO_PRIZES[Math.floor(Math.random() * DEMO_PRIZES.length)]!

  return (
    <Screen className="flex min-h-svh flex-col items-center justify-center gap-5 text-center">
      <div className="campaign-gradient flex h-28 w-28 items-center justify-center rounded-full">
        <Gift size={44} className="text-white" aria-hidden="true" />
      </div>
      <div>
        <h1 className="text-[28px] font-extrabold text-ink">{REWARD_KIND_LABEL[rewardKind]}</h1>
        <p className="mt-2 max-w-xs text-[17px] text-muted">{prize}</p>
      </div>

      <Card className="w-full space-y-2 text-left text-[15px]">
        <Row label="Patrocinador" value="Aliados ME PERDÍ" />
        <Row label="Vigencia" value="30 días desde hoy" />
        <Row label="Código de canje" value={Math.random().toString(36).slice(2, 8).toUpperCase()} />
      </Card>

      <p className="text-[13px] text-muted">Reglas y probabilidades disponibles en el comprobante. Ver comprobante.</p>

      <Button asChild variant="secondary" className="w-full">
        <Link to="/auth" search={{ redirectTo: redirectPath }}>
          Guardar en mi cuenta
        </Link>
      </Button>
    </Screen>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-night/5 pb-2 last:border-0 last:pb-0">
      <span className="text-muted">{label}</span>
      <span className="font-bold text-ink">{value}</span>
    </div>
  )
}
