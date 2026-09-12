import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Settings } from 'lucide-react'
import { getAdminConfig, patchAdminConfig } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Switch } from '../../components/ui/Switch'
import { Chip } from '../../components/ui/Chip'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/settings')({
  component: SettingsScreen,
})

const FLAG_LABEL: Record<string, string> = {
  instagramLogin: 'Login con Instagram',
  tiktokLogin: 'Login con TikTok',
  blockchainRewards: 'Recompensas en blockchain',
  freeRewardDynamic: 'Dinámica de recompensa gratuita',
}

/** AD11 — Configuración: textos, países, idiomas, proveedores, feature flags y canales. */
function SettingsScreen() {
  const queryClient = useQueryClient()
  const query = useQuery({ queryKey: ['admin-config'], queryFn: getAdminConfig })

  const patch = useMutation({
    mutationFn: (featureFlags: Record<string, boolean>) => patchAdminConfig({ featureFlags }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-config'] }),
  })

  return (
    <div>
      <AdminPageHeader icon={Settings} title="Configuración" description="Textos, países, idiomas, proveedores, feature flags y canales." />

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {query.data && (
        <div className="flex flex-col gap-4">
          <Card>
            <p className="mb-3 text-[15px] font-bold text-ink">Feature flags</p>
            <div className="flex flex-col gap-3">
              {Object.entries(query.data.featureFlags).map(([key, enabled]) => (
                <div key={key} className="flex items-center justify-between">
                  <p className="text-[14px] font-semibold text-ink">{FLAG_LABEL[key] ?? key}</p>
                  <Switch
                    checked={enabled}
                    onCheckedChange={(checked) => patch.mutate({ ...query.data.featureFlags, [key]: checked })}
                    label={FLAG_LABEL[key] ?? key}
                  />
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[15px] font-bold text-ink">Países soportados</p>
            <div className="flex flex-wrap gap-2">
              {query.data.supportedCountries.map((c) => (
                <Chip key={c} tone="muted">
                  {c}
                </Chip>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[15px] font-bold text-ink">Idiomas</p>
            <div className="flex flex-wrap gap-2">
              {query.data.supportedLanguages.map((l) => (
                <Chip key={l} tone="muted">
                  {l}
                </Chip>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[15px] font-bold text-ink">Proveedores de acceso</p>
            <div className="flex flex-wrap gap-2">
              {query.data.oauthProviders.map((p) => (
                <Chip key={p} tone="violet">
                  {p}
                </Chip>
              ))}
            </div>
          </Card>

          <Card>
            <p className="mb-3 text-[15px] font-bold text-ink">Canales de notificación</p>
            <div className="flex flex-wrap gap-2">
              {query.data.notificationChannels.map((c) => (
                <Chip key={c} tone="aqua">
                  {c}
                </Chip>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
