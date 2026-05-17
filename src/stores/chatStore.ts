'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Conversation, Message, NLPResult, PersonaId } from '@/types/chat'

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

function now(): string {
  return new Date().toISOString()
}

function makeConversation(persona: PersonaId = 'productivity'): Conversation {
  return {
    id: makeId(),
    title: 'New Chat',
    persona,
    messages: [],
    sessionId: makeId(),
    createdAt: now(),
    updatedAt: now(),
  }
}

interface ChatStore {
  conversations: Conversation[]
  activeId: string | null
  isStreaming: boolean

  // Conversation management
  createConversation: (persona?: PersonaId) => string
  deleteConversation: (id: string) => void
  setActive: (id: string) => void
  renameConversation: (id: string, title: string) => void
  setPersonaForConversation: (id: string, persona: PersonaId) => void

  setTitle: (id: string, title: string) => void

  // Message operations (target active conversation)
  addMessage: (msg: Message) => void
  appendChunk: (chunk: string) => void
  finalizeMessage: (content: string, nlp?: NLPResult) => void
  setStreaming: (v: boolean) => void
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: null,
      isStreaming: false,

      createConversation(persona = 'productivity') {
        const conv = makeConversation(persona)
        set((s) => ({ conversations: [conv, ...s.conversations], activeId: conv.id }))
        return conv.id
      },

      deleteConversation(id) {
        set((s) => {
          const filtered = s.conversations.filter((c) => c.id !== id)
          let activeId = s.activeId
          if (activeId === id) {
            activeId = filtered[0]?.id ?? null
          }
          return { conversations: filtered, activeId }
        })
      },

      setActive(id) {
        set({ activeId: id })
      },

      renameConversation(id, title) {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: now() } : c
          ),
        }))
      },

      setPersonaForConversation(id, persona) {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, persona, updatedAt: now() } : c
          ),
        }))
      },

      setTitle(id, title) {
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: now() } : c
          ),
        }))
      },

      addMessage(msg) {
        const { activeId } = get()
        if (!activeId) return
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== activeId) return c
            return { ...c, messages: [...c.messages, msg], updatedAt: now() }
          }),
        }))
      },

      appendChunk(chunk) {
        const { activeId } = get()
        if (!activeId) return
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== activeId) return c
            const messages = [...c.messages]
            const last = messages[messages.length - 1]
            if (last?.role === 'assistant') {
              messages[messages.length - 1] = { ...last, content: last.content + chunk }
            }
            return { ...c, messages }
          }),
        }))
      },

      finalizeMessage(content, nlp) {
        const { activeId } = get()
        if (!activeId) return
        set((s) => ({
          conversations: s.conversations.map((c) => {
            if (c.id !== activeId) return c
            const messages = [...c.messages]
            const last = messages[messages.length - 1]
            if (last?.role === 'assistant') {
              messages[messages.length - 1] = {
                ...last,
                content,
                nlp,
                isStreaming: false,
              }
            }
            return { ...c, messages, updatedAt: now() }
          }),
        }))
      },

      setStreaming(isStreaming) {
        set({ isStreaming })
      },
    }),
    {
      name: 'chatbot-conversations',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Ensure IDs are valid after rehydration
        if (!state.activeId && state.conversations.length > 0) {
          state.activeId = state.conversations[0].id
        }
      },
    }
  )
)

// Selectors
export const selectActiveConversation = (s: ReturnType<typeof useChatStore.getState>) =>
  s.conversations.find((c) => c.id === s.activeId) ?? null
