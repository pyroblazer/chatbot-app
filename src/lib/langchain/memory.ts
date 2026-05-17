import { HumanMessage, AIMessage, BaseMessage } from '@langchain/core/messages'

const MAX_TURNS = 20

export interface ChatHistory {
  messages: BaseMessage[]
  addUserMessage: (content: string) => void
  addAIMessage: (content: string) => void
  getMessages: () => BaseMessage[]
  clear: () => void
}

export function createChatHistory(): ChatHistory {
  const messages: BaseMessage[] = []

  return {
    messages,
    addUserMessage(content: string) {
      messages.push(new HumanMessage(content))
      if (messages.length > MAX_TURNS * 2) {
        messages.splice(0, messages.length - MAX_TURNS * 2)
      }
    },
    addAIMessage(content: string) {
      messages.push(new AIMessage(content))
    },
    getMessages() {
      return [...messages]
    },
    clear() {
      messages.length = 0
    },
  }
}
