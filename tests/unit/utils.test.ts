import { cn, formatTime, sanitizeInput } from '@/lib/utils'

describe('cn', () => {
  test('joins truthy class strings', () => {
    expect(cn('a', 'b', 'c')).toBe('a b c')
  })

  test('filters out empty strings', () => {
    expect(cn('a', '', 'b')).toBe('a b')
  })

  test('returns empty string when all inputs are empty', () => {
    expect(cn('', '')).toBe('')
  })
})

describe('formatTime', () => {
  test('formats a Date to HH:MM', () => {
    const date = new Date(2024, 0, 1, 9, 5)
    const result = formatTime(date)
    expect(result).toMatch(/^\d{2}:\d{2}$/)
  })
})

describe('sanitizeInput', () => {
  test('strips HTML tags', () => {
    expect(sanitizeInput('<b>hello</b>')).toBe('hello')
  })

  test('trims whitespace', () => {
    expect(sanitizeInput('  hello  ')).toBe('hello')
  })

  test('truncates to 2000 characters', () => {
    const long = 'a'.repeat(3000)
    expect(sanitizeInput(long)).toHaveLength(2000)
  })

  test('strips tags but preserves inner text', () => {
    // The regex removes tag markup, not the text between tags
    expect(sanitizeInput('<b>bold</b> text')).toBe('bold text')
  })
})
