import { PERSONAS } from '@/constants/personas'

describe('PERSONAS', () => {
  test('contains at least 5 personas', () => {
    expect(PERSONAS.length).toBeGreaterThanOrEqual(5)
  })

  test('each persona has required fields', () => {
    for (const p of PERSONAS) {
      expect(typeof p.id).toBe('string')
      expect(typeof p.name).toBe('string')
      expect(typeof p.description).toBe('string')
      expect(typeof p.icon).toBe('string')
      expect(typeof p.color).toBe('string')
    }
  })

  test('all persona ids are unique', () => {
    const ids = PERSONAS.map((p) => p.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  test('includes coder persona', () => {
    expect(PERSONAS.find((p) => p.id === 'coder')).toBeDefined()
  })

  test('includes health, finance, and legal personas', () => {
    const ids = PERSONAS.map((p) => p.id)
    expect(ids).toContain('health')
    expect(ids).toContain('finance')
    expect(ids).toContain('legal')
  })
})
