import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import {
  AlertTriangle,
  BookOpenCheck,
  Gauge,
  Gift,
  Landmark,
  Layers,
  ScrollText,
  Settings,
  ShieldAlert,
  Sliders,
  Users,
} from 'lucide-react'
import { getAdminDashboard } from '@meperdi/api-client'
import { Card } from '../../components/ui/Card'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/')({
  component: AdminDashboardScreen,
})

const SECTIONS = [
  { to: '/admin/batches', label: 'Lotes de tags', description: 'Crear/importar, PIN e impresión', icon: Layers },
  { to: '/admin/users', label: 'Usuarios e identidades', description: 'Búsqueda, estado y métodos', icon: Users },
  { to: '/admin/moderation', label: 'Perfiles y moderación', description: 'Fotos/textos reportados', icon: ShieldAlert },
  { to: '/admin/cases', label: 'Casos', description: 'Avisos, devoluciones, disputas', icon: BookOpenCheck },
  { to: '/admin/fund', label: 'Fondo comunitario', description: 'Entradas, reservas y premios', icon: Landmark },
  { to: '/admin/reward-catalog', label: 'Catálogo de premios', description: 'Aliado, inventario y costo', icon: Gift },
  { to: '/admin/reward-rules', label: 'Reglas de recompensa', description: 'Garantizado, topes y país', icon: Sliders },
  { to: '/admin/risk', label: 'Riesgo y fraude', description: 'Velocidad, duplicados, geo', icon: AlertTriangle },
  { to: '/admin/audit', label: 'Auditoría', description: 'Actor, acción y motivo', icon: ScrollText },
  { to: '/admin/settings', label: 'Configuración', description: 'Textos, países, flags', icon: Settings },
] as const

/** AD01 — Dashboard: tags, activaciones, pérdidas, devoluciones, tasa de recuperación y fondo. */
function AdminDashboardScreen() {
  const query = useQuery({ queryKey: ['admin-dashboard'], queryFn: getAdminDashboard })

  return (
    <div>
      <div className="mb-6 flex items-center gap-2.5">
        <Gauge size={22} className="text-violet" aria-hidden="true" />
        <h1 className="text-[22px] font-extrabold text-ink">Dashboard</h1>
      </div>

      {query.isLoading && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      {query.data && (
        <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Tags totales" value={query.data.tagsTotal} />
          <StatCard label="Activaciones" value={query.data.activations} />
          <StatCard label="Pérdidas" value={query.data.losses} />
          <StatCard label="Devoluciones" value={query.data.returns} />
          <StatCard label="Tasa de recuperación" value={`${query.data.recoveryRate}%`} />
          <StatCard label="Saldo del fondo" value={`Bs ${query.data.fundBalance.toLocaleString('es-BO')}`} />
        </div>
      )}

      {query.data && (
        <Card className="mb-8">
          <p className="mb-3 text-[15px] font-bold text-ink">Tags por estado</p>
          <div className="flex flex-wrap gap-2">
            {Object.entries(query.data.byStatus).map(([status, count]) => (
              <span key={status} className="rounded-pill bg-night/5 px-3 py-1.5 text-[13px] font-bold text-ink">
                {status}: {count}
              </span>
            ))}
          </div>
        </Card>
      )}

      <p className="mb-3 text-[15px] font-bold text-ink">Secciones</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link key={section.to} to={section.to}>
            <Card className="flex items-center gap-3 transition hover:border-2 hover:border-violet/30">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-button bg-violet/10 text-violet">
                <section.icon size={20} aria-hidden="true" />
              </div>
              <div>
                <p className="text-[16px] font-extrabold text-ink">{section.label}</p>
                <p className="text-[13px] text-muted">{section.description}</p>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-[13px] font-semibold text-muted">{label}</p>
      <p className="mt-1 text-[22px] font-extrabold text-ink">{value}</p>
    </Card>
  )
}
