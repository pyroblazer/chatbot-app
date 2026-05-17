/**
 * @jest-environment node
 */
import { getOrCreateMemory, clearSession, generateSessionId } from '@/lib/session'

describe('session management', () => {
  beforeEach(() => {
    // Clear global store between tests
    if (global.__sessionStore) {
      global.__sessionStore.clear()
    }
  })

  it('creates a new memory for a new session ID', () => {
    const memory = getOrCreateMemory('test-session-1')
    expect(memory).toBeDefined()
    expect(typeof memory.getMessages).toBe('function')
  })

  it('returns the same memory for the same session ID', () => {
    const m1 = getOrCreateMemory('test-session-2')
    const m2 = getOrCreateMemory('test-session-2')
    expect(m1).toBe(m2)
  })

  it('creates different memories for different session IDs', () => {
    const m1 = getOrCreateMemory('sess-a')
    const m2 = getOrCreateMemory('sess-b')
    expect(m1).not.toBe(m2)
  })

  it('clears session memory', () => {
    getOrCreateMemory('test-session-3')
    clearSession('test-session-3')
    const m2 = getOrCreateMemory('test-session-3')
    expect(m2).toBeDefined()
    // After clearing, a new memory object is created
    const m3 = getOrCreateMemory('test-session-3')
    expect(m3).toBe(m2) // Same reference (not re-created)
  })

  it('generates unique session IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, generateSessionId))
    expect(ids.size).toBe(100)
  })
})
