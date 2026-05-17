'use client'

import { useCallback, useRef } from 'react'
import { useChatStore, selectActiveConversation } from '@/stores/chatStore'
import { parseNLPMeta } from '@/lib/langchain/nlp'
import { sanitizeInput } from '@/lib/utils'
import type { Message } from '@/types/chat'

function makeId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `id_${Date.now()}_${Math.random().toString(36).slice(2)}`
}

export function useChat() {
  const store = useChatStore()
  const abortRef = useRef<AbortController | null>(null)

  const activeConv = selectActiveConversation(store)
  const messages = activeConv?.messages ?? []
  const isStreaming = store.isStreaming

  const sendMessage = useCallback(
    async (rawInput: string) => {
      const input = sanitizeInput(rawInput)
      if (!input || store.isStreaming) return

      const activeConv = selectActiveConversation(useChatStore.getState())
      if (!activeConv) return

      const { sessionId, persona } = activeConv

      const userMsg: Message = {
        id: makeId(),
        role: 'user',
        content: input,
        timestamp: new Date().toISOString(),
      }
      store.addMessage(userMsg)

      const assistantMsg: Message = {
        id: makeId(),
        role: 'assistant',
        content: '',
        timestamp: new Date().toISOString(),
        isStreaming: true,
      }
      store.addMessage(assistantMsg)
      store.setStreaming(true)

      abortRef.current = new AbortController()

      try {
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: input, sessionId, persona }),
          signal: abortRef.current.signal,
        })

        if (!res.ok) throw new Error(`API error ${res.status}`)

        const reader = res.body!.getReader()
        const decoder = new TextDecoder()
        let accumulated = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          const chunk = decoder.decode(value, { stream: true })
          accumulated += chunk
          useChatStore.getState().appendChunk(chunk)
        }

        const { text, nlp } = parseNLPMeta(accumulated)
        useChatStore.getState().finalizeMessage(text, nlp ?? undefined)

        // Generate a summary title after the first exchange
        const conv = selectActiveConversation(useChatStore.getState())
        if (conv && conv.title === 'New Chat' && conv.messages.length >= 2) {
          const convId = conv.id
          const snippet = conv.messages.slice(0, 4).map((m) => ({ role: m.role, content: m.content }))
          fetch('/api/title', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages: snippet }),
          })
            .then((r) => r.json())
            .then(({ title }) => {
              if (title && title !== 'New Chat') {
                useChatStore.getState().setTitle(convId, title)
              }
            })
            .catch(() => {})
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          useChatStore.getState().finalizeMessage('Sorry, something went wrong. Please try again.')
        }
      } finally {
        useChatStore.getState().setStreaming(false)
        abortRef.current = null
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  const cancel = useCallback(() => {
    abortRef.current?.abort()
  }, [])

  return { messages, isStreaming, sendMessage, cancel }
}
