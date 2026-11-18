import type { Conversation } from '@/types/chat'

export interface SearchHit {
  conversation: Conversation
  /** Short text around the first match, or the title when only the title matched. */
  snippet: string
}

/** Case-insensitive search over conversation titles and message bodies. */
export function searchConversations(conversations: Conversation[], query: string): SearchHit[] {
  const q = query.trim().toLowerCase()
  if (!q) return conversations.map((conversation) => ({ conversation, snippet: '' }))

  const hits: SearchHit[] = []
  for (const conversation of conversations) {
    if (conversation.title.toLowerCase().includes(q)) {
      hits.push({ conversation, snippet: conversation.title })
      continue
    }
    for (const m of conversation.messages) {
      const idx = m.content.toLowerCase().indexOf(q)
      if (idx >= 0) {
        const start = Math.max(0, idx - 30)
        hits.push({
          conversation,
          snippet: `${start > 0 ? '…' : ''}${m.content.slice(start, idx + q.length + 50)}`,
        })
        break
      }
    }
  }
  return hits
}
