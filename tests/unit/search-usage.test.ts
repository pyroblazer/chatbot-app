/**
 * @jest-environment node
 */
import { searchConversations } from '@/lib/search'
import { conversationUsage, estimateTokens } from '@/lib/usage'
import type { Conversation, Message } from '@/types/chat'

const msg = (id: string, role: 'user' | 'assistant', content: string): Message => ({
  id,
  role,
  content,
  timestamp: new Date().toISOString(),
})

const conv = (id: string, title: string, messages: Message[]): Conversation => ({
  id,
  title,
  persona: 'productivity',
  messages,
  sessionId: id,
  createdAt: '',
  updatedAt: '',
})

describe('searchConversations', () => {
  const list = [
    conv('a', 'Trip to Bali', [msg('1', 'user', 'hello')]),
    conv('b', 'Coding help', [msg('2', 'user', 'How do I use useEffect in React?')]),
  ]

  it('returns everything for an empty query', () => {
    expect(searchConversations(list, '  ')).toHaveLength(2)
  })

  it('matches titles case-insensitively', () => {
    const hits = searchConversations(list, 'bali')
    expect(hits.map((h) => h.conversation.id)).toEqual(['a'])
  })

  it('matches message bodies and returns a snippet around the hit', () => {
    const hits = searchConversations(list, 'useeffect')
    expect(hits).toHaveLength(1)
    expect(hits[0].snippet).toContain('useEffect')
  })

  it('returns nothing when nothing matches', () => {
    expect(searchConversations(list, 'zzz')).toEqual([])
  })
})

describe('usage', () => {
  it('estimates ~4 chars per token, rounding up', () => {
    expect(estimateTokens('')).toBe(0)
    expect(estimateTokens('abcd')).toBe(1)
    expect(estimateTokens('abcde')).toBe(2)
  })

  it('sums a conversation', () => {
    const u = conversationUsage([msg('1', 'user', 'abcdefgh'), msg('2', 'assistant', 'abcd')])
    expect(u).toEqual({ tokens: 3, messages: 2 })
  })
})
