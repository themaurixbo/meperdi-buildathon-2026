import { http } from 'msw'
import { fail, ok } from '../respond'
import { db, randomToken } from '../db'

const otpByEmail = new Map<string, string>()

function pushAudit(actor: string, action: string, object: string, reason: string, before?: string, after?: string) {
  db.auditLog.unshift({
    id: randomToken(),
    actor,
    action,
    object,
    before,
    after,
    reason,
    ipSummary: '190.10.xx.xx',
    occurredAt: new Date().toISOString(),
  })
}

/**
 * Extensión no listada en la sección 12: back-office de administración (AD01-AD11).
 * Interacciones simplificadas donde el documento no detalla el contrato — el backend
 * real de Fase 1 deberá formalizarlo, incluyendo control de acceso por rol.
 */
export const adminHandlers = [
  http.post('/api/admin/auth/login', async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string }
    if (!body.email || !body.password) return fail('invalid_credentials', 'Revisa tu correo y contraseña.', 400)
    const code = String(Math.floor(100000 + Math.random() * 900000))
    otpByEmail.set(body.email, code)
    // eslint-disable-next-line no-console
    console.info(`[mock] Código 2FA de administración para ${body.email}: ${code}`)
    return ok({ sent: true as const })
  }),

  http.post('/api/admin/auth/verify-2fa', async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string }
    const expected = otpByEmail.get(body.email)
    if (!expected || expected !== body.code) {
      return fail('invalid_code', 'El código no es válido o expiró.', 400, { code: 'Revisa el código de 6 dígitos.' })
    }
    return ok({ displayName: 'Equipo ME PERDÍ', email: body.email })
  }),

  // AD01 — Dashboard
  http.get('/api/admin/dashboard', async () => {
    const tags = [...db.tags.values()]
    const byStatus = tags.reduce<Record<string, number>>((acc, t) => {
      acc[t.status] = (acc[t.status] ?? 0) + 1
      return acc
    }, {})
    const activations = tags.filter((t) => t.status !== 'UNCLAIMED').length
    const losses = tags.filter((t) => t.status === 'LOST' || t.status === 'RETURN_PENDING' || t.status === 'RETURNED').length
    const returns = tags.filter((t) => t.status === 'RETURNED').length
    const recoveryRate = losses > 0 ? Math.round((returns / losses) * 100) : 0
    const fundBalance = db.fundEntries.reduce((sum, e) => sum + e.amountBs, 0)
    return ok({ tagsTotal: tags.length, byStatus, activations, losses, returns, recoveryRate, fundBalance })
  }),

  // AD02 — Lotes de tags
  http.get('/api/admin/tag-batches', async () => ok([...db.tagBatches].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))),
  http.post('/api/admin/tag-batches', async ({ request }) => {
    const body = (await request.json()) as { label: string; quantity: number; publicSlugPrefix: string }
    const batch = { id: randomToken(), status: 'printing' as const, createdAt: new Date().toISOString(), ...body }
    db.tagBatches.unshift(batch)
    pushAudit('admin@meperdi.com', 'Crear lote de tags', `${batch.id} (${batch.quantity} unidades)`, 'Alta desde AD02')
    return ok(batch, { status: 201 })
  }),

  // AD03 — Usuarios e identidades
  http.get('/api/admin/users', async () => ok([...db.adminUsers].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))),
  http.post('/api/admin/users/:id/toggle-status', async ({ params }) => {
    const user = db.adminUsers.find((u) => u.id === params.id)
    if (!user) return fail('not_found', 'Usuario no encontrado.', 404)
    const before = user.status
    user.status = user.status === 'active' ? 'suspended' : 'active'
    pushAudit('admin@meperdi.com', 'Cambiar estado de usuario', `${user.id} (${user.email})`, 'Acción manual desde AD03', before, user.status)
    return ok(user)
  }),

  // AD04 — Perfiles y moderación
  http.get('/api/admin/moderation-reports', async () => ok([...db.moderationReports].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt)))),
  http.post('/api/admin/moderation-reports/:id/resolve', async ({ params, request }) => {
    const report = db.moderationReports.find((r) => r.id === params.id)
    if (!report) return fail('not_found', 'Reporte no encontrado.', 404)
    const body = (await request.json()) as { action: 'warn' | 'suspend' | 'dismiss' }
    const before = report.status
    report.status = body.action === 'dismiss' ? 'dismissed' : body.action === 'warn' ? 'warned' : 'suspended'
    pushAudit('admin@meperdi.com', 'Resolver reporte de moderación', `${report.itemName} (${report.field})`, report.reason, before, report.status)
    return ok(report)
  }),

  // AD05 — Casos
  http.get('/api/admin/cases', async () => ok([...db.adminCases].sort((a, b) => a.slaHoursLeft - b.slaHoursLeft))),
  http.post('/api/admin/cases/:id/assign', async ({ params, request }) => {
    const adminCase = db.adminCases.find((c) => c.id === params.id)
    if (!adminCase) return fail('not_found', 'Caso no encontrado.', 404)
    const body = (await request.json()) as { assignedTo: string }
    adminCase.assignedTo = body.assignedTo
    adminCase.status = 'in_review'
    return ok(adminCase)
  }),

  // AD06 — Fondo comunitario
  http.get('/api/admin/fund', async () => {
    const entries = [...db.fundEntries].sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    const balance = db.fundEntries.reduce((sum, e) => sum + e.amountBs, 0)
    return ok({ entries, balance })
  }),

  // AD07 — Catálogo de premios
  http.get('/api/admin/reward-catalog', async () => ok([...db.rewardCatalog].sort((a, b) => a.priority - b.priority))),

  // AD08 — Reglas de recompensa
  http.get('/api/admin/reward-rules', async () => ok(db.rewardRules)),
  http.patch('/api/admin/reward-rules/:id', async ({ params, request }) => {
    const rule = db.rewardRules.find((r) => r.id === params.id)
    if (!rule) return fail('not_found', 'Regla no encontrada.', 404)
    const patch = (await request.json()) as Partial<typeof rule>
    Object.assign(rule, patch)
    pushAudit('admin@meperdi.com', 'Editar regla de recompensa', rule.name, 'Ajuste desde AD08')
    return ok(rule)
  }),

  // AD09 — Riesgo y fraude
  http.get('/api/admin/risk-signals', async () => ok([...db.riskSignals].sort((a, b) => b.detectedAt.localeCompare(a.detectedAt)))),
  http.post('/api/admin/risk-signals/:id/resolve', async ({ params, request }) => {
    const signal = db.riskSignals.find((s) => s.id === params.id)
    if (!signal) return fail('not_found', 'Señal no encontrada.', 404)
    const body = (await request.json()) as { action: 'block' | 'clear' }
    const before = signal.status
    signal.status = body.action === 'block' ? 'blocked' : 'cleared'
    pushAudit('admin@meperdi.com', 'Resolver señal de riesgo', signal.description, `Tipo: ${signal.type}`, before, signal.status)
    return ok(signal)
  }),

  // AD10 — Auditoría
  http.get('/api/admin/audit-log', async () => ok(db.auditLog)),

  // AD11 — Configuración
  http.get('/api/admin/config', async () => ok(db.adminConfig)),
  http.patch('/api/admin/config', async ({ request }) => {
    const patch = (await request.json()) as Partial<typeof db.adminConfig>
    Object.assign(db.adminConfig, patch)
    pushAudit('admin@meperdi.com', 'Actualizar configuración', 'AD11', 'Ajuste desde el panel de configuración')
    return ok(db.adminConfig)
  }),
]
