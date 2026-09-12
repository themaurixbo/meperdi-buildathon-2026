import { describe, expect, it } from 'vitest'
import {
  canTransitionTag,
  isNeutralSupportOnly,
  isPubliclyViewableTagStatus,
  requiresActivation,
} from './tag'

describe('tag status rules', () => {
  it('requires activation only when UNCLAIMED', () => {
    expect(requiresActivation('UNCLAIMED')).toBe(true)
    expect(requiresActivation('ACTIVE')).toBe(false)
  })

  it('never allows the first scan to silently claim a tag', () => {
    // UNCLAIMED can only move to ACTIVE through the activation flow (PIN required),
    // never directly to a "publicly viewable" state without activation.
    expect(canTransitionTag('UNCLAIMED', 'ACTIVE')).toBe(true)
    expect(canTransitionTag('UNCLAIMED', 'LOST')).toBe(false)
  })

  it('exposes public profile for ACTIVE, LOST, RETURN_PENDING and RETURNED', () => {
    expect(isPubliclyViewableTagStatus('ACTIVE')).toBe(true)
    expect(isPubliclyViewableTagStatus('LOST')).toBe(true)
    expect(isPubliclyViewableTagStatus('RETURN_PENDING')).toBe(true)
    expect(isPubliclyViewableTagStatus('RETURNED')).toBe(true)
    expect(isPubliclyViewableTagStatus('UNCLAIMED')).toBe(false)
    expect(isPubliclyViewableTagStatus('SUSPENDED')).toBe(false)
  })

  it('treats SUSPENDED and DEACTIVATED as neutral, support-only surfaces', () => {
    expect(isNeutralSupportOnly('SUSPENDED')).toBe(true)
    expect(isNeutralSupportOnly('DEACTIVATED')).toBe(true)
    expect(isNeutralSupportOnly('ACTIVE')).toBe(false)
  })

  it('allows a returned tag to go back to ACTIVE', () => {
    expect(canTransitionTag('RETURNED', 'ACTIVE')).toBe(true)
  })
})
