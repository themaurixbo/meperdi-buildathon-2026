import { apiRequest } from './http'

export interface AdminDashboard {
  tagsTotal: number
  byStatus: Record<string, number>
  activations: number
  losses: number
  returns: number
  recoveryRate: number
  fundBalance: number
}

export interface AdminTagBatch {
  id: string
  label: string
  quantity: number
  publicSlugPrefix: string
  status: 'printing' | 'printed' | 'shipped'
  createdAt: string
}

export interface AdminUser {
  id: string
  displayName: string
  email: string
  linkedMethods: string[]
  status: 'active' | 'suspended'
  itemsCount: number
  createdAt: string
}

export interface AdminModerationReport {
  id: string
  itemId: string
  itemName: string
  field: 'photo' | 'public_message'
  reason: string
  status: 'pending' | 'warned' | 'suspended' | 'dismissed'
  reportedAt: string
}

export interface AdminCase {
  id: string
  kind: 'finder_report' | 'return' | 'dispute'
  refId: string
  summary: string
  status: 'open' | 'in_review' | 'resolved'
  slaHoursLeft: number
  assignedTo: string | null
  createdAt: string
}

export interface AdminFundEntry {
  id: string
  kind: 'income' | 'reserve' | 'payout'
  amountBs: number
  description: string
  occurredAt: string
}

export interface AdminRewardCatalogEntry {
  id: string
  partnerName: string
  item: string
  inventory: number
  costBs: number
  segment: string
  validUntil: string
  priority: number
}

export interface AdminRewardRule {
  id: string
  name: string
  guaranteed: boolean
  dynamicEnabled: boolean
  capPerUser: number
  minAge: number
  countries: string[]
  antifraude: string
}

export interface AdminRiskSignal {
  id: string
  type: 'scan_velocity' | 'duplicate_account' | 'geo_anomaly'
  description: string
  severity: 'low' | 'medium' | 'high'
  status: 'open' | 'blocked' | 'cleared'
  detectedAt: string
}

export interface AdminAuditEntry {
  id: string
  actor: string
  action: string
  object: string
  before?: string
  after?: string
  reason: string
  ipSummary: string
  occurredAt: string
}

export interface AdminConfig {
  supportedCountries: string[]
  supportedLanguages: string[]
  oauthProviders: string[]
  featureFlags: Record<string, boolean>
  notificationChannels: string[]
}

export function startAdminLogin(email: string, password: string): Promise<{ sent: true }> {
  return apiRequest<{ sent: true }>('/api/admin/auth/login', { method: 'POST', body: { email, password } })
}

export function verifyAdminLogin(email: string, code: string): Promise<{ displayName: string; email: string }> {
  return apiRequest<{ displayName: string; email: string }>('/api/admin/auth/verify-2fa', {
    method: 'POST',
    body: { email, code },
  })
}

/** Simple shared-secret admin login (for internal admin panel) */
export function adminLogin(password: string): Promise<{ success: boolean; token: string }> {
  return apiRequest<{ success: boolean; token: string }>('/api/admin/login', {
    method: 'POST',
    body: { password },
  })
}

/** AD01 */
export function getAdminDashboard(): Promise<AdminDashboard> {
  return apiRequest<AdminDashboard>('/api/admin/dashboard')
}

/** AD02 */
export function listTagBatches(): Promise<AdminTagBatch[]> {
  return apiRequest<AdminTagBatch[]>('/api/admin/tag-batches')
}

export function createTagBatch(body: { label: string; quantity: number; publicSlugPrefix: string }): Promise<AdminTagBatch> {
  return apiRequest<AdminTagBatch>('/api/admin/tag-batches', { method: 'POST', body })
}

/** AD03 */
export function listAdminUsers(): Promise<AdminUser[]> {
  return apiRequest<AdminUser[]>('/api/admin/users')
}

export function toggleUserStatus(userId: string): Promise<AdminUser> {
  return apiRequest<AdminUser>(`/api/admin/users/${userId}/toggle-status`, { method: 'POST' })
}

/** AD04 */
export function listModerationReports(): Promise<AdminModerationReport[]> {
  return apiRequest<AdminModerationReport[]>('/api/admin/moderation-reports')
}

export function resolveModerationReport(
  reportId: string,
  action: 'warn' | 'suspend' | 'dismiss',
): Promise<AdminModerationReport> {
  return apiRequest<AdminModerationReport>(`/api/admin/moderation-reports/${reportId}/resolve`, {
    method: 'POST',
    body: { action },
  })
}

/** AD05 */
export function listAdminCases(): Promise<AdminCase[]> {
  return apiRequest<AdminCase[]>('/api/admin/cases')
}

export function assignAdminCase(caseId: string, assignedTo: string): Promise<AdminCase> {
  return apiRequest<AdminCase>(`/api/admin/cases/${caseId}/assign`, { method: 'POST', body: { assignedTo } })
}

/** AD06 */
export function getCommunityFund(): Promise<{ entries: AdminFundEntry[]; balance: number }> {
  return apiRequest<{ entries: AdminFundEntry[]; balance: number }>('/api/admin/fund')
}

/** AD07 */
export function listRewardCatalog(): Promise<AdminRewardCatalogEntry[]> {
  return apiRequest<AdminRewardCatalogEntry[]>('/api/admin/reward-catalog')
}

/** AD08 */
export function listRewardRules(): Promise<AdminRewardRule[]> {
  return apiRequest<AdminRewardRule[]>('/api/admin/reward-rules')
}

export function patchRewardRule(ruleId: string, patch: Partial<AdminRewardRule>): Promise<AdminRewardRule> {
  return apiRequest<AdminRewardRule>(`/api/admin/reward-rules/${ruleId}`, { method: 'PATCH', body: patch })
}

/** AD09 */
export function listRiskSignals(): Promise<AdminRiskSignal[]> {
  return apiRequest<AdminRiskSignal[]>('/api/admin/risk-signals')
}

export function resolveRiskSignal(signalId: string, action: 'block' | 'clear'): Promise<AdminRiskSignal> {
  return apiRequest<AdminRiskSignal>(`/api/admin/risk-signals/${signalId}/resolve`, { method: 'POST', body: { action } })
}

/** AD10 */
export function listAuditLog(): Promise<AdminAuditEntry[]> {
  return apiRequest<AdminAuditEntry[]>('/api/admin/audit-log')
}

/** AD11 */
export function getAdminConfig(): Promise<AdminConfig> {
  return apiRequest<AdminConfig>('/api/admin/config')
}

export function patchAdminConfig(patch: Partial<AdminConfig>): Promise<AdminConfig> {
  return apiRequest<AdminConfig>('/api/admin/config', { method: 'PATCH', body: patch })
}
