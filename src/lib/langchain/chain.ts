import { getGroqModel } from '@/lib/groq'
import { buildPromptTemplate } from './prompts'
import { getOrCreateMemory } from '@/lib/session'
import { retrieveContext } from './rag'
import type { PersonaId } from '@/types/chat'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { AIMessage, HumanMessage } from '@langchain/core/messages'

export async function* streamChat(
  message: string,
  sessionId: string,
  persona: PersonaId,
  clientHistory?: { role: 'user' | 'assistant'; content: string }[],
  signal?: AbortSignal
): AsyncGenerator<string> {
  const history = getOrCreateMemory(sessionId)
  // Serverless instances do not share memory, so prefer the history the client sends
  const historyMessages = clientHistory
    ? clientHistory.map((m) => (m.role === 'user' ? new HumanMessage(m.content) : new AIMessage(m.content)))
    : history.getMessages()
  const context = await retrieveContext(message, persona)

  const enrichedInput = context
    ? `[Relevant knowledge base context for your persona:\n${context}\n---]\n\n${message}`
    : message

  const prompt = buildPromptTemplate(persona)
  const model = getGroqModel()
  const chain = prompt.pipe(model).pipe(new StringOutputParser())

  const stream = await chain.stream({ input: enrichedInput, history: historyMessages }, { signal })

  let fullResponse = ''
  for await (const chunk of stream) {
    fullResponse += chunk
    yield chunk
  }

  history.addUserMessage(message)
  history.addAIMessage(fullResponse)
}
