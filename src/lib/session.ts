import { createChatHistory, type ChatHistory } from './langchain/memory'
import { generateSessionId as _generateSessionId } from './session-client'

declare global {
  var __sessionStore: Map<string, ChatHistory> | undefined
}

function getStore(): Map<string, ChatHistory> {
  if (!global.__sessionStore) {
    global.__sessionStore = new Map()
  }
  return global.__sessionStore
}

export function getOrCreateMemory(sessionId: string): ChatHistory {
  const store = getStore()
  if (!store.has(sessionId)) {
    store.set(sessionId, createChatHistory())
  }
  return store.get(sessionId)!
}

export function clearSession(sessionId: string): void {
  getStore().delete(sessionId)
}

export { _generateSessionId as generateSessionId }

export function trimMemory(): void {
  // trimming is handled internally by addUserMessage
}
