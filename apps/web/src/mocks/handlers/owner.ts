import { http } from 'msw'
import type { ItemType } from '@meperdi/domain'
import { fail, ok } from '../respond'
import { db, findTagBySlug, logActivityEvent, randomHandoffCode, randomToken } from '../db'
import { summarizeUserAgent } from '../../lib/deviceInfo'

const activationAttempts = new Map<string, number>()
const MAX_ATTEMPTS = 5

export const ownerHandlers = [
  // Extensión no listada en la sección 12: el prototipo necesita listar "mis tags" (D02).
  // En el mock, "mío" = todo tag ya activado (no hay multiusuario real en Fase 0).
  http.get('/api/items', async () => {
    const summaries = [...db.tags.values()]
      .filter((tag) => tag.itemId && tag.status !== 'UNCLAIMED')
      .map((tag) => {
        const item = db.items.get(tag.itemId!)!
        return {
          itemId: item.id,
          publicSlug: tag.publicSlug,
          tagStatus: tag.status,
          itemType: item.type,
          name: item.name,
          photoUrl: item.photoUrl,
        }
      })
    return ok(summaries)
  }),

  // Extensión no listada en la sección 12: timeline de avisos del propietario (D07).
  http.get('/api/reports', async () => {
    const myTagIds = new Set([...db.tags.values()].filter((t) => t.itemId).map((t) => t.id))
    const reports = [...db.finderReports.values()]
      .filter((r) => myTagIds.has(r.tagId))
      .map((r) => {
        const tag = db.tags.get(r.tagId)
        const item = tag?.itemId ? db.items.get(tag.itemId) : null
        return {
          caseNumber: r.caseNumber,
          itemName: item?.name ?? 'Tag',
          publicSlug: tag?.publicSlug ?? '',
          message: r.message ?? null,
          locationShared: r.locationShared,
          createdAt: r.createdAt,
        }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    return ok(reports)
  }),

  // D08 — detalle de un aviso puntual, con la ubicación que solo ve el propietario.
  http.get('/api/reports/:caseNumber', async ({ params }) => {
    const caseNumber = String(params.caseNumber)
    const report = [...db.finderReports.values()].find((r) => r.caseNumber === caseNumber)
    if (!report) return fail('report_not_found', 'No encontramos ese aviso.', 404)

    const tag = db.tags.get(report.tagId)
    const item = tag?.itemId ? db.items.get(tag.itemId) : null

    return ok({
      caseNumber: report.caseNumber,
      itemName: item?.name ?? 'Tag',
      itemPhotoUrl: item?.photoUrl ?? null,
      publicSlug: tag?.publicSlug ?? '',
      message: report.message ?? null,
      locationShared: report.locationShared,
      createdAt: report.createdAt,
      contactOptIn: report.contactOptIn,
      contactPhoneE164: report.contactPhoneE164,
      sharedLocation: report.sharedLocation,
    })
  }),

  // Extensión no listada en la sección 12: historial de actividad del tag (botón D03).
  http.get('/api/items/:id/activity', async ({ params }) => {
    const id = String(params.id)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    const events = db.activityEvents
      .filter((e) => e.tagId === tag.id)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))
      .map((e) => ({
        id: e.id,
        type: e.type,
        occurredAt: e.occurredAt,
        deviceSummary: e.userAgent ? summarizeUserAgent(e.userAgent) : null,
        ip: e.ip ?? null,
        lat: e.lat,
        lng: e.lng,
        locationNote: e.locationNote,
      }))

    return ok(events)
  }),

  http.get('/api/items/:id', async ({ params }) => {
    const id = String(params.id)
    const item = db.items.get(id)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    return ok({
      itemId: item.id,
      publicSlug: tag.publicSlug,
      tagStatus: tag.status,
      itemType: item.type,
      name: item.name,
      photoUrl: item.photoUrl,
      supportPhotoUrls: item.supportPhotoUrls,
      publicMessage: item.publicMessage,
      petDetails: item.petDetails ?? null,
      objectDetails: item.objectDetails ?? null,
      contacts: item.contacts
        .slice()
        .sort((a, b) => a.priority - b.priority)
        .map((c) => ({ id: c.id, label: c.label, channels: c.channels, priority: c.priority, phoneE164: c.phoneE164, schedule: c.schedule, visiblePublicly: c.visiblePublicly })),
      lostReport: item.lostReport,
    })
  }),

  http.post('/api/tags/:slug/activate', async ({ params, request }) => {
    const slug = String(params.slug)
    const tag = findTagBySlug(slug)
    if (!tag) return fail('tag_not_found', 'Este código no corresponde a ningún tag ME PERDÍ.', 404)
    if (tag.status !== 'UNCLAIMED') return fail('already_activated', 'Este tag ya tiene un propietario.', 409)

    const attempts = activationAttempts.get(tag.id) ?? 0
    if (attempts >= MAX_ATTEMPTS) {
      return fail('too_many_attempts', 'Demasiados intentos. Espera unos minutos antes de volver a intentar.', 429)
    }

    const body = (await request.json()) as { pin: string }
    if (body.pin !== tag.activationPin) {
      activationAttempts.set(tag.id, attempts + 1)
      return fail('invalid_pin', 'El PIN no es correcto.', 400, { pin: 'Revisa el PIN impreso en tu tag.' })
    }

    activationAttempts.delete(tag.id)
    return ok({ tagStatus: tag.status, reserved: true as const })
  }),

  http.post('/api/items', async ({ request }) => {
    const body = (await request.json()) as { tagPublicSlug: string; itemType: ItemType; name: string }
    const tag = findTagBySlug(body.tagPublicSlug)
    if (!tag) return fail('tag_not_found', 'Este código no corresponde a ningún tag ME PERDÍ.', 404)
    if (tag.status !== 'UNCLAIMED') return fail('already_activated', 'Este tag ya tiene un propietario.', 409)

    const itemId = randomToken()
    db.items.set(itemId, {
      id: itemId,
      type: body.itemType,
      name: body.name,
      photoUrl: null,
      supportPhotoUrls: [],
      publicMessage: null,
      contacts: [],
      lostReport: null,
    })
    tag.itemId = itemId
    tag.status = 'ACTIVE'
    logActivityEvent({ tagId: tag.id, type: 'activated' })

    return ok({ itemId, publicSlug: tag.publicSlug }, { status: 201 })
  }),

  http.patch('/api/items/:id', async ({ params, request }) => {
    const id = String(params.id)
    const item = db.items.get(id)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const patch = (await request.json()) as Record<string, unknown>
    Object.assign(item, patch)
    return ok({ updated: true as const })
  }),

  http.post('/api/items/:id/lost-reports', async ({ params, request }) => {
    const id = String(params.id)
    const item = db.items.get(id)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    const body = (await request.json()) as { lostAt: string; areaText: string; circumstances?: string; instructions?: string }
    item.lostReport = body
    tag.status = 'LOST'
    logActivityEvent({ tagId: tag.id, type: 'lost_declared' })

    return ok({ lostReportId: randomToken(), tagStatus: tag.status }, { status: 201 })
  }),

  // Extensión no listada en la sección 12: "Ya volvió" (D06) — el propietario confirma
  // directamente que la mascota/objeto regresó sin pasar por el flujo formal de devolución.
  http.post('/api/items/:id/mark-home', async ({ params }) => {
    const id = String(params.id)
    const item = db.items.get(id)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    item.lostReport = null
    tag.status = 'ACTIVE'
    logActivityEvent({ tagId: tag.id, type: 'returned_home' })

    return ok({ tagStatus: tag.status })
  }),

  // Extensión no listada en la sección 12: transferir tag (D12).
  http.post('/api/items/:id/transfer', async ({ params, request }) => {
    const id = String(params.id)
    const item = db.items.get(id)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    const body = (await request.json()) as { recipientHint: string }
    const token = randomToken()
    const code = randomHandoffCode()
    db.transfers.set(token, { token, itemId: id, code, recipientHint: body.recipientHint, accepted: false })

    return ok({ transferToken: token, code }, { status: 201 })
  }),

  // D13 — desactivar (reversible) y eliminar (libera el tag) con doble confirmación en la UI.
  http.post('/api/items/:id/deactivate', async ({ params }) => {
    const id = String(params.id)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)
    tag.status = 'DEACTIVATED'
    logActivityEvent({ tagId: tag.id, type: 'deactivated' })
    return ok({ tagStatus: tag.status })
  }),

  http.post('/api/items/:id/delete', async ({ params }) => {
    const id = String(params.id)
    const tag = [...db.tags.values()].find((t) => t.itemId === id)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)
    logActivityEvent({ tagId: tag.id, type: 'deleted' })
    db.items.delete(id)
    tag.itemId = null
    tag.status = 'UNCLAIMED'
    return ok({ tagStatus: tag.status })
  }),

  http.post('/api/return-cases', async ({ request }) => {
    const body = (await request.json()) as { itemId: string; finderReportId?: string }
    const item = db.items.get(body.itemId)
    if (!item) return fail('item_not_found', 'No encontramos este perfil.', 404)
    const tag = [...db.tags.values()].find((t) => t.itemId === body.itemId)
    if (!tag) return fail('tag_not_found', 'No encontramos el tag asociado.', 404)

    const id = randomToken()
    db.returnCases.set(id, {
      id,
      itemId: body.itemId,
      finderReportId: body.finderReportId,
      status: 'proposed',
      handoffCode: null,
      claimToken: null,
    })
    tag.status = 'RETURN_PENDING'

    return ok({ returnCaseId: id, caseToken: id, status: 'proposed' as const }, { status: 201 })
  }),

  http.get('/api/return-cases/:id', async ({ params }) => {
    const id = String(params.id)
    const returnCase = db.returnCases.get(id)
    if (!returnCase) return fail('case_not_found', 'No encontramos ese caso de devolución.', 404)
    const item = db.items.get(returnCase.itemId)
    return ok({
      returnCaseId: returnCase.id,
      caseToken: returnCase.id,
      status: returnCase.status,
      itemName: item?.name ?? 'Tag',
      handoffCode: returnCase.handoffCode,
      claimToken: returnCase.claimToken,
    })
  }),

  http.post('/api/return-cases/:id/handoff-code', async ({ params }) => {
    const id = String(params.id)
    const returnCase = db.returnCases.get(id)
    if (!returnCase) return fail('case_not_found', 'No encontramos ese caso de devolución.', 404)

    returnCase.handoffCode = randomHandoffCode()
    returnCase.status = 'accepted'
    const expiresAt = new Date(Date.now() + 1000 * 60 * 30).toISOString()
    return ok({ code: returnCase.handoffCode, expiresAt })
  }),

  http.post('/api/return-cases/:id/confirm', async ({ params }) => {
    const id = String(params.id)
    const returnCase = db.returnCases.get(id)
    if (!returnCase) return fail('case_not_found', 'No encontramos ese caso de devolución.', 404)
    if (returnCase.status !== 'in_transit') {
      return fail('not_ready', 'Todavía no se verificó el código de entrega.', 409)
    }

    returnCase.status = 'delivered'
    if (!returnCase.claimToken) returnCase.claimToken = randomToken()

    const tag = [...db.tags.values()].find((t) => t.itemId === returnCase.itemId)
    if (tag) {
      tag.status = 'RETURNED'
      logActivityEvent({ tagId: tag.id, type: 'return_confirmed' })
    }

    if (!db.rewardClaims.has(returnCase.claimToken)) {
      db.rewardClaims.set(returnCase.claimToken, {
        claimToken: returnCase.claimToken,
        returnCaseId: returnCase.id,
        status: 'pending',
        rewardKind: null,
      })
    }

    return ok({ status: returnCase.status, claimToken: returnCase.claimToken })
  }),
]
