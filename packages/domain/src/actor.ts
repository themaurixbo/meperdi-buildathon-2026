/** Actores del sistema — sección 5 de la especificación. */
export const ACTOR_ROLES = ['finder', 'owner', 'partner', 'support', 'admin'] as const

export type ActorRole = (typeof ACTOR_ROLES)[number]

export type Permission =
  | 'view_public_profile'
  | 'send_finder_report'
  | 'share_location'
  | 'contact_owner'
  | 'activate_tag'
  | 'edit_item'
  | 'declare_lost'
  | 'view_reports'
  | 'confirm_return'
  | 'validate_gift_token'
  | 'view_partner_redemptions'
  | 'resolve_support_case'
  | 'manage_fraud_and_rewards'
  | 'view_audit_log'

const ROLE_PERMISSIONS: Record<ActorRole, readonly Permission[]> = {
  finder: ['view_public_profile', 'send_finder_report', 'share_location', 'contact_owner'],
  owner: [
    'activate_tag',
    'edit_item',
    'declare_lost',
    'view_reports',
    'confirm_return',
  ],
  partner: ['validate_gift_token', 'view_partner_redemptions'],
  support: ['resolve_support_case'],
  admin: ['manage_fraud_and_rewards', 'view_audit_log', 'resolve_support_case'],
}

export function roleHasPermission(role: ActorRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission)
}
