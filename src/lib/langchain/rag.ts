import type { PersonaId } from '@/types/chat'
import { getVectorStore, PERSONA_SOURCE } from './vectorstore'

export async function retrieveContext(query: string, persona: PersonaId, k = 3): Promise<string> {
  try {
    const store = await getVectorStore()
    const sourceFile = PERSONA_SOURCE[persona]
    const results = await store.similaritySearch(query, k, sourceFile)
    if (results.length === 0) return ''
    return results.map((doc) => doc.pageContent).join('\n\n---\n\n')
  } catch {
    return ''
  }
}
