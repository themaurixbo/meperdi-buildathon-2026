import { describe, expect, it } from 'vitest'
import { finderMessageSchema, locationConsentSchema } from './finder'

describe('locationConsentSchema', () => {
  it('rejects a location without explicit consent', () => {
    const result = locationConsentSchema.safeParse({
      lat: -17.78,
      lng: -63.18,
      accuracyM: 15,
      consentGiven: false,
    })
    expect(result.success).toBe(false)
  })

  it('accepts a location with explicit consent', () => {
    const result = locationConsentSchema.safeParse({
      lat: -17.78,
      lng: -63.18,
      accuracyM: 15,
      consentGiven: true,
    })
    expect(result.success).toBe(true)
  })
})

describe('finderMessageSchema', () => {
  it('rejects a message over 500 characters', () => {
    const result = finderMessageSchema.safeParse({ body: 'a'.repeat(501), contactOptIn: false })
    expect(result.success).toBe(false)
  })
})
