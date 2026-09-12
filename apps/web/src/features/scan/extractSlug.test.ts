import { describe, expect, it } from 'vitest'
import { extractSlugFromScan } from './extractSlug'

describe('extractSlugFromScan', () => {
  it('extracts the slug from a full URL', () => {
    expect(extractSlugFromScan('https://meperdi.com/t/activa-luna')).toBe('activa-luna')
  })

  it('extracts the slug from a relative path', () => {
    expect(extractSlugFromScan('/t/perdida-nala')).toBe('perdida-nala')
  })

  it('accepts a bare slug', () => {
    expect(extractSlugFromScan('sin-activar-001')).toBe('sin-activar-001')
  })

  it('rejects unrelated content', () => {
    expect(extractSlugFromScan('https://example.com/otra-cosa')).toBeNull()
    expect(extractSlugFromScan('hola mundo')).toBeNull()
  })
})
