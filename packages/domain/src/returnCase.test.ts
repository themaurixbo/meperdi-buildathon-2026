import { describe, expect, it } from 'vitest'
import { canConfirmDelivery, canTransitionReturnCase } from './returnCase'

describe('return case rules', () => {
  it('only allows delivery confirmation while in_transit', () => {
    expect(canConfirmDelivery('in_transit')).toBe(true)
    expect(canConfirmDelivery('delivered')).toBe(false)
  })

  it('a cancelled case is terminal', () => {
    expect(canTransitionReturnCase('cancelled', 'accepted')).toBe(false)
  })
})
