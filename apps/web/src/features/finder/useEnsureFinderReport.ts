import { createFinderReport } from '@meperdi/api-client'
import { useFinderReportStore } from '../../stores/finderReportStore'

/**
 * F04/F06 son puntos de entrada independientes: el finder puede compartir ubicación o
 * escribir un mensaje sin haber tocado antes "Avisar que estoy aquí". Si todavía no existe
 * un aviso (guestToken) para este tag, se crea uno silenciosamente primero.
 */
export function useEnsureFinderReport(publicSlug: string) {
  const getReport = useFinderReportStore((s) => s.getReport)
  const saveReport = useFinderReportStore((s) => s.saveReport)

  return async function ensureFinderReport(message?: string): Promise<string> {
    const existing = getReport(publicSlug)
    if (existing) return existing.guestToken

    const created = await createFinderReport(publicSlug, { message, contactOptIn: false })
    saveReport(publicSlug, created)
    return created.guestToken
  }
}
