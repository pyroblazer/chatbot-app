import type { PersonaId, Message } from './chat'

export interface ChatRequest {
  message: string
  sessionId: string
  persona: PersonaId
}

export interface RecommendationsRequest {
  messages: Pick<Message, 'role' | 'content'>[]
}

export interface RecommendationsResponse {
  recommendations: string[]
}

export interface ExportRequest {
  messages: Message[]
  format: 'json' | 'txt'
}

export interface ApiError {
  error: string
  code?: string
}
