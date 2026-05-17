import { getGroqModel } from '@/lib/groq'
import { buildPromptTemplate } from './prompts'
import { getOrCreateMemory } from '@/lib/session'
import { retrieveContext } from './rag'
import type { PersonaId } from '@/types/chat'
import { StringOutputParser } from '@langchain/core/output_parsers'

export async function* streamChat(
  message: string,
  sessionId: string,
  persona: PersonaId
): AsyncGenerator<string> {
  const history = getOrCreateMemory(sessionId)
  const historyMessages = history.getMessages()
  const context = await retrieveContext(message, persona)

  const enrichedInput = context
    ? `[Relevant knowledge base context for your persona:\n${context}\n---]\n\n${message}`
    : message

  const prompt = buildPromptTemplate(persona)
  const model = getGroqModel()
  const chain = prompt.pipe(model).pipe(new StringOutputParser())

  const stream = await chain.stream({ input: enrichedInput, history: historyMessages })

  let fullResponse = ''
  for await (const chunk of stream) {
    fullResponse += chunk
    yield chunk
  }

  history.addUserMessage(message)
  history.addAIMessage(fullResponse)
}
