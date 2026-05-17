export type PersonaId =
  | 'productivity'
  | 'customer-service'
  | 'education'
  | 'travel'
  | 'coder'
  | 'health'
  | 'finance'
  | 'legal'

export interface Persona {
  id: PersonaId
  name: string
  description: string
  icon: string
  color: string
}

export type SentimentLabel = 'positive' | 'neutral' | 'negative'

export interface SentimentResult {
  label: SentimentLabel
  score: number
}

export type EntityType = 'PERSON' | 'PLACE' | 'DATE' | 'PRODUCT' | 'CONCEPT'

export interface Entity {
  text: string
  type: EntityType
}

export type IntentLabel =
  | 'question'
  | 'complaint'
  | 'request'
  | 'greeting'
  | 'farewell'
  | 'recommendation_request'
  | 'other'

export interface NLPResult {
  intent: IntentLabel
  sentiment: SentimentResult
  entities: Entity[]
}

export type MessageRole = 'user' | 'assistant'

export interface Message {
  id: string
  role: MessageRole
  content: string
  timestamp: string   // ISO string - safe to serialize/persist
  nlp?: NLPResult
  isStreaming?: boolean
}

export interface Conversation {
  id: string
  title: string
  persona: PersonaId
  messages: Message[]
  sessionId: string
  createdAt: string   // ISO string
  updatedAt: string   // ISO string
}
