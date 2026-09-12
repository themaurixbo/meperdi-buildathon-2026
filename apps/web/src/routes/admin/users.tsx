import { useMemo, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Search, Users } from 'lucide-react'
import { listAdminUsers, toggleUserStatus } from '@meperdi/api-client'
import { AdminPageHeader } from '../../components/admin/AdminPageHeader'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { CardSkeleton } from '../../components/ui/StateViews'

export const Route = createFileRoute('/admin/users')({
  component: AdminUsersScreen,
})

/** AD03 — Usuarios e identidades: búsqueda, estado, métodos vinculados y acciones auditadas. */
function AdminUsersScreen() {
  const queryClient = useQueryClient()
  const [search, setSearch] = useState('')
  const query = useQuery({ queryKey: ['admin-users'], queryFn: listAdminUsers })

  const toggle = useMutation({
    mutationFn: (userId: string) => toggleUserStatus(userId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
  })

  const filtered = useMemo(() => {
    const rows = query.data ?? []
    const term = search.trim().toLowerCase()
    if (!term) return rows
    return rows.filter((u) => u.displayName.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
  }, [query.data, search])

  return (
    <div>
      <AdminPageHeader icon={Users} title="Usuarios e identidades" description="Búsqueda, estado, métodos vinculados y acciones auditadas." />

      <div className="relative mb-5">
        <Search size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por nombre o correo"
          className="h-[50px] w-full rounded-field border-2 border-night/10 bg-white pl-11 pr-4 text-[16px] text-ink placeholder:text-muted focus:border-violet focus:outline-none"
        />
      </div>

      {query.isLoading && (
        <div className="flex flex-col gap-3">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((user) => (
          <Card key={user.id} className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-[16px] font-extrabold text-ink">{user.displayName}</p>
              <p className="truncate text-[13px] text-muted">{user.email}</p>
              <p className="mt-1 text-[13px] text-muted">
                {user.itemsCount} tag(s) · {user.linkedMethods.join(', ')}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span
                className={`rounded-pill px-3 py-1 text-[13px] font-bold ${
                  user.status === 'active' ? 'bg-aqua/15 text-ink' : 'bg-danger/12 text-danger'
                }`}
              >
                {user.status === 'active' ? 'Activo' : 'Suspendido'}
              </span>
              <Button
                variant="secondary"
                size="compact"
                loading={toggle.isPending && toggle.variables === user.id}
                onClick={() => toggle.mutate(user.id)}
              >
                {user.status === 'active' ? 'Suspender' : 'Reactivar'}
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
