import { http } from 'msw'
import { applyDevNetworkScenario, fail, ok } from '../respond'
import { db, findTagBySlug, logActivityEvent, nextCaseNumber, randomToken, toPublicProfile } from '../db'

export const publicHandlers = [
  http.get('/api/public/tags/:slug', async ({ params }) => {
    const scenario = await applyDevNetworkScenario()
    if (scenario === 'forced-error') return fail('server_error', 'No pudimos cargar este tag. Inténtalo de nuevo.', 500)

    const slug = String(params.slug)
    const tag = findTagBySlug(slug)
    if (!tag) return fail('tag_not_found', 'Este código no corresponde a ningún tag ME PERDÍ.', 404)

    return ok(toPublicProfile(tag))
  }),

  http.post('/api/public/tags/:slug/scans', async ({ params, request }) => {
    const slug = String(params.slug)
    const tag = findTagBySlug(slug)
    if (!tag) return fail('tag_not_found', 'Este código no corresponde a ningún tag ME PERDÍ.', 404)

    const device = (await request.json().catch(() => null)) as {
      userAgent?: string
      language?: string
      timeZone?: string
      screen?: string
      referrer?: string
      ip?: string | null
    } | null

    logActivityEvent({
      tagId: tag.id,
      type: 'scan',
      userAgent: device?.userAgent,
      language: device?.language,
      timeZone: device?.timeZone,
      screen: device?.screen,
      referrer: device?.referrer,
      ip: device?.ip ?? null,
    })

    return ok({ tagStatus: tag.status })
  }),

  http.post('/api/public/tags/:slug/finder-reports', async ({ params, request }) => {
    const scenario = await applyDevNetworkScenario()
    if (scenario === 'forced-error') return fail('server_error', 'No pudimos enviar tu aviso. Inténtalo de nuevo.', 500)

    const slug = String(params.slug)
    const tag = findTagBySlug(slug)
    if (!tag) return fail('tag_not_found', 'Este código no corresponde a ningún tag ME PERDÍ.', 404)

    const body = (await request.json()) as { message?: string; contactOptIn: boolean; contactPhoneE164?: string }
    const id = randomToken()
    const guestToken = randomToken()
    const caseNumber = nextCaseNumber()

    db.finderReports.set(guestToken, {
      id,
      guestToken,
      caseNumber,
      tagId: tag.id,
      message: body.message,
      contactOptIn: body.contactOptIn,
      contactPhoneE164: body.contactPhoneE164,
      locationShared: false,
      createdAt: new Date().toISOString(),
    })

    logActivityEvent({ tagId: tag.id, type: 'finder_report' })

    return ok({ caseNumber, guestToken, status: 'received' as const }, { status: 201 })
  }),

  http.post('/api/public/finder-reports/:token/location', async ({ params, request }) => {
    const token = String(params.token)
    const report = db.finderReports.get(token)
    if (!report) return fail('report_not_found', 'No encontramos ese aviso.', 404)
    const body = (await request.json()) as { lat: number; lng: number; accuracyM: number; note?: string }
    report.locationShared = true
    report.sharedLocation = body
    logActivityEvent({
      tagId: report.tagId,
      type: 'location_shared',
      lat: body.lat,
      lng: body.lng,
      locationNote: body.note,
    })
    return ok({ accepted: true as const })
  }),

  http.post('/api/public/finder-reports/:token/messages', async ({ params, request }) => {
    const token = String(params.token)
    const report = db.finderReports.get(token)
    if (!report) return fail('report_not_found', 'No encontramos ese aviso.', 404)
    const body = (await request.json()) as { text: string }
    report.message = body.text
    return ok({ messageId: randomToken() })
  }),

  // D12 — el destinatario acepta la transferencia con el código que le compartió el propietario.
  http.post('/api/public/transfers/:token/accept', async ({ params, request }) => {
    const token = String(params.token)
    const transfer = db.transfers.get(token)
    if (!transfer) return fail('transfer_not_found', 'Este enlace de transferencia ya no es válido.', 404)
    const body = (await request.json()) as { code: string }
    if (body.code !== transfer.code) {
      return fail('invalid_code', 'El código no es correcto.', 400, { code: 'Revisa el código de 6 dígitos.' })
    }
    transfer.accepted = true
    logActivityEvent({
      tagId: [...db.tags.values()].find((t) => t.itemId === transfer.itemId)?.id ?? '',
      type: 'transferred',
    })
    return ok({ accepted: true as const })
  }),

  http.get('/api/public/return-cases/:token', async ({ params }) => {
    const token = String(params.token)
    const returnCase = db.returnCases.get(token)
    if (!returnCase) return fail('case_not_found', 'No encontramos ese caso de devolución.', 404)
    const item = db.items.get(returnCase.itemId)
    return ok({
      status: returnCase.status,
      itemName: item?.name ?? 'Tag',
      itemPhotoUrl: item?.photoUrl ?? null,
      hasReward: returnCase.hasReward,
      caseId: returnCase.caseId,
    })
  }),

  http.post('/api/public/return-cases/:token/verify-code', async ({ params, request }) => {
    const token = String(params.token)
    const returnCase = db.returnCases.get(token)
    if (!returnCase) return fail('case_not_found', 'No encontramos ese caso de devolución.', 404)
    const body = (await request.json()) as { code: string }
    const valid = returnCase.handoffCode !== null && returnCase.handoffCode === body.code
    if (valid) returnCase.status = 'in_transit'
    return ok({ valid })
  }),
]
