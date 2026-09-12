import { apiRequest, newIdempotencyKey } from './http'
import type {
  DeviceInfoInput,
  FinderReportResult,
  LocationShareResult,
  MessageSentResult,
  PublicReturnCaseView,
  ScanResult,
  TagPublicProfile,
  VerifyCodeResult,
} from './types'

export function getTagPublicProfile(publicSlug: string, signal?: AbortSignal): Promise<TagPublicProfile> {
  return apiRequest<TagPublicProfile>(`/api/public/tags/${publicSlug}`, { signal })
}

export function registerScan(publicSlug: string, device?: DeviceInfoInput): Promise<ScanResult> {
  return apiRequest<ScanResult>(`/api/public/tags/${publicSlug}/scans`, {
    method: 'POST',
    body: device,
    idempotencyKey: newIdempotencyKey(),
  })
}

export function createFinderReport(
  publicSlug: string,
  body: { message?: string; contactOptIn: boolean; contactPhoneE164?: string },
): Promise<FinderReportResult> {
  return apiRequest<FinderReportResult>(`/api/public/tags/${publicSlug}/finder-reports`, {
    method: 'POST',
    body,
    idempotencyKey: newIdempotencyKey(),
  })
}

export function shareFinderLocation(
  finderReportToken: string,
  body: { lat: number; lng: number; accuracyM: number; note?: string },
): Promise<LocationShareResult> {
  return apiRequest<LocationShareResult>(`/api/public/finder-reports/${finderReportToken}/location`, {
    method: 'POST',
    body,
  })
}

export function sendFinderMessage(
  finderReportToken: string,
  body: { text: string },
): Promise<MessageSentResult> {
  return apiRequest<MessageSentResult>(`/api/public/finder-reports/${finderReportToken}/messages`, {
    method: 'POST',
    body,
  })
}

export function getPublicReturnCase(caseToken: string): Promise<PublicReturnCaseView> {
  return apiRequest<PublicReturnCaseView>(`/api/public/return-cases/${caseToken}`)
}

export function acceptTransfer(transferToken: string, body: { code: string }): Promise<{ accepted: true }> {
  return apiRequest<{ accepted: true }>(`/api/public/transfers/${transferToken}/accept`, {
    method: 'POST',
    body,
  })
}

export function verifyHandoffCode(
  returnCaseToken: string,
  body: { code: string },
): Promise<VerifyCodeResult> {
  return apiRequest<VerifyCodeResult>(`/api/public/return-cases/${returnCaseToken}/verify-code`, {
    method: 'POST',
    body,
  })
}
