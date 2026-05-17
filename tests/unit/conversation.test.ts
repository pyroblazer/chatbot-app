/**
 * @jest-environment node
 */
import { useChatStore, selectActiveConversation } from '@/stores/chatStore'

// Minimal localStorage mock
const store: Record<string, string> = {}
Object.defineProperty(global, 'localStorage', {
  value: {
    getItem: (k: string) => store[k] ?? null,
    setItem: (k: string, v: string) => { store[k] = v },
    removeItem: (k: string) => { delete store[k] },
  },
})

Object.defineProperty(global, 'crypto', {
  value: { randomUUID: () => Math.random().toString(36).slice(2) },
})

function getStore() {
  return useChatStore.getState()
}

beforeEach(() => {
  useChatStore.setState({ conversations: [], activeId: null, isStreaming: false })
})

describe('chatStore - multi-conversation', () => {
  test('createConversation returns an id and sets activeId', () => {
    const id = getStore().createConversation()
    expect(typeof id).toBe('string')
    expect(getStore().activeId).toBe(id)
    expect(getStore().conversations).toHaveLength(1)
  })

  test('createConversation with persona sets the persona', () => {
    const id = getStore().createConversation('coder')
    const conv = getStore().conversations.find((c) => c.id === id)
    expect(conv?.persona).toBe('coder')
  })

  test('deleteConversation removes the conversation', () => {
    const id = getStore().createConversation()
    getStore().deleteConversation(id)
    expect(getStore().conversations).toHaveLength(0)
    expect(getStore().activeId).toBeNull()
  })

  test('deleteConversation switches activeId to next conversation', () => {
    const id1 = getStore().createConversation()
    const id2 = getStore().createConversation()
    // id2 is now active (created last)
    getStore().deleteConversation(id2)
    expect(getStore().activeId).toBe(id1)
  })

  test('setActive changes the active conversation', () => {
    const id1 = getStore().createConversation()
    const id2 = getStore().createConversation()
    getStore().setActive(id1)
    expect(getStore().activeId).toBe(id1)
    getStore().setActive(id2)
    expect(getStore().activeId).toBe(id2)
  })

  test('renameConversation updates the title', () => {
    const id = getStore().createConversation()
    getStore().renameConversation(id, 'My Renamed Chat')
    const conv = getStore().conversations.find((c) => c.id === id)
    expect(conv?.title).toBe('My Renamed Chat')
  })

  test('setPersonaForConversation updates the persona', () => {
    const id = getStore().createConversation('productivity')
    getStore().setPersonaForConversation(id, 'travel')
    const conv = getStore().conversations.find((c) => c.id === id)
    expect(conv?.persona).toBe('travel')
  })

  test('addMessage appends to the active conversation', () => {
    getStore().createConversation()
    getStore().addMessage({ id: 'msg1', role: 'user', content: 'Hello', timestamp: new Date().toISOString() })
    const active = selectActiveConversation(getStore())
    expect(active?.messages).toHaveLength(1)
    expect(active?.messages[0].content).toBe('Hello')
  })

  test('title stays New Chat until setTitle is called', () => {
    getStore().createConversation()
    getStore().addMessage({ id: 'm1', role: 'user', content: 'What is TypeScript?', timestamp: new Date().toISOString() })
    const active = selectActiveConversation(getStore())
    expect(active?.title).toBe('New Chat')
  })

  test('setTitle updates the conversation title', () => {
    const id = getStore().createConversation()
    getStore().setTitle(id, 'TypeScript Basics')
    const conv = getStore().conversations.find((c) => c.id === id)
    expect(conv?.title).toBe('TypeScript Basics')
  })

  test('appendChunk appends to the last assistant message', () => {
    getStore().createConversation()
    getStore().addMessage({ id: 'a1', role: 'assistant', content: 'Hello', timestamp: new Date().toISOString() })
    getStore().appendChunk(' world')
    const active = selectActiveConversation(getStore())
    expect(active?.messages[0].content).toBe('Hello world')
  })

  test('finalizeMessage updates the last assistant message', () => {
    getStore().createConversation()
    getStore().addMessage({ id: 'a1', role: 'assistant', content: 'loading...', timestamp: new Date().toISOString(), isStreaming: true })
    getStore().finalizeMessage('Final answer')
    const active = selectActiveConversation(getStore())
    expect(active?.messages[0].content).toBe('Final answer')
    expect(active?.messages[0].isStreaming).toBe(false)
  })

  test('messages in different conversations are isolated', () => {
    const id1 = getStore().createConversation()
    getStore().addMessage({ id: 'm1', role: 'user', content: 'Msg in conv1', timestamp: new Date().toISOString() })
    const id2 = getStore().createConversation()
    getStore().addMessage({ id: 'm2', role: 'user', content: 'Msg in conv2', timestamp: new Date().toISOString() })

    const conv1 = getStore().conversations.find((c) => c.id === id1)
    const conv2 = getStore().conversations.find((c) => c.id === id2)
    expect(conv1?.messages[0].content).toBe('Msg in conv1')
    expect(conv2?.messages[0].content).toBe('Msg in conv2')
  })

  test('selectActiveConversation returns null when no activeId', () => {
    expect(selectActiveConversation(getStore())).toBeNull()
  })
})
