import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Sliders } from 'lucide-react'
import { listRewardRules, patchRewardRule } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Switch'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/reward-rules')({
  component: RewardRulesScreen,
})

/** AD08 — Reglas de recompensa: premio garantizado, dinámica opcional, topes, edad, país y antifraude. */
function RewardRulesScreen() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-reward-rules'], queryFn: listRewardRules })

  const patch = useMutation({
    mutationFn: ({ id, dynamicEnabled }: { id: string; dynamicEnabled: boolean }) => patchRewardRule(id, { dynamicEnabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-reward-rules'] }),
  })

  return (
    <div>
      <AdminPageHeader icon={Sliders} title="Reglas de recompensa" description="Premio garantizado, dinámica opcional, topes, edad, país y antifraude." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {query.data?.map((rule) => (
          <Card key={rule.id}>
            <div className="flex items-start justify-between gap-3">
              <p className="text-[16px] font-extrabold text-ink">{rule.name}</p>
              <span
                className={`whitespace-nowrap rounded-pill px-3 py-1 text-[13px] font-bold ${
                  rule.guaranteed ? 'bg-aqua/15 text-ink' : 'bg-night/5 text-ink'
                }`}
              >
                {rule.guaranteed ? 'Garantizado' : 'Opcional'}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[16px] font-extrabold text-ink">{rule.capPerUser}</p>
                <p className="text-[12px] text-muted">Tope/usuario</p>
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-ink">{rule.minAge}+</p>
                <p className="text-[12px] text-muted">Edad mínima</p>
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-ink">{rule.countries.join(', ')}</p>
                <p className="text-[12px] text-muted">Países</p>
              </div>
            </div>
            <p className="mt-3 text-[13px] text-muted">{rule.antifraude}</p>
            {!rule.guaranteed && (
              <div className="mt-4 flex items-center justify-between border-t-2 border-night/5 pt-3">
                <p className="text-[14px] font-semibold text-ink">Dinámica activa</p>
                <Switch
                  checked={rule.dynamicEnabled}
                  onCheckedChange={(checked) => patch.mutate({ id: rule.id, dynamicEnabled: checked })}
                  label={`Activar dinámica de ${rule.name}`}
                />
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
