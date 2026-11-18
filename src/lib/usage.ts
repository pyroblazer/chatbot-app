import type { Message } from '@/types/chat'

/** Rough token estimate (~4 characters per token for English); good enough for a usage hint. */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4)
}

export function conversationUsage(messages: Message[]): { tokens: number; messages: number } {
  return {
    tokens: messages.reduce((n, m) => n + estimateTokens(m.content), 0),
    messages: messages.length,
  }
}
