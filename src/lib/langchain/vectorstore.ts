import { Document } from '@langchain/core/documents'
import type { PersonaId } from '@/types/chat'
import path from 'path'
import fs from 'fs'

// Map each persona to the knowledge-base file it should retrieve from
const PERSONA_SOURCE: Record<PersonaId, string> = {
  productivity: 'productivity-tips.md',
  'customer-service': 'customer-service-faq.md',
  education: 'education-resources.md',
  travel: 'travel-destinations.md',
  coder: 'coding-guide.md',
  health: 'health-wellness.md',
  finance: 'finance-guide.md',
  legal: 'legal-guide.md',
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'of', 'to', 'in', 'on', 'for', 'is', 'are', 'was', 'were', 'be',
  'it', 'this', 'that', 'with', 'as', 'at', 'by', 'from', 'how', 'what', 'do', 'does', 'i', 'you',
  'my', 'me', 'can', 'should', 'would', 'about',
])

export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 1 && !STOP_WORDS.has(t))
}

interface Entry {
  doc: Document
  terms: Map<string, number>
  length: number
}

/**
 * Small in-memory BM25 index. Retrieval is lexical (not semantic) but honest: results
 * actually share words with the query, unlike the previous character-code "embeddings".
 */
export class KeywordIndex {
  private entries: Entry[] = []
  private docFreq = new Map<string, number>()
  private avgLength = 0

  addDocuments(docs: Document[]): void {
    for (const doc of docs) {
      const tokens = tokenize(doc.pageContent)
      const terms = new Map<string, number>()
      for (const t of tokens) terms.set(t, (terms.get(t) ?? 0) + 1)
      for (const t of terms.keys()) this.docFreq.set(t, (this.docFreq.get(t) ?? 0) + 1)
      this.entries.push({ doc, terms, length: tokens.length })
    }
    this.avgLength =
      this.entries.reduce((sum, e) => sum + e.length, 0) / Math.max(this.entries.length, 1)
  }

  similaritySearch(query: string, k = 3, sourceFile?: string): Document[] {
    const queryTerms = tokenize(query)
    if (queryTerms.length === 0) return []
    const pool = sourceFile
      ? this.entries.filter((e) => e.doc.metadata.source === sourceFile)
      : this.entries
    const n = this.entries.length
    const k1 = 1.5
    const b = 0.75

    return pool
      .map((e) => {
        let score = 0
        for (const t of queryTerms) {
          const tf = e.terms.get(t)
          if (!tf) continue
          const df = this.docFreq.get(t) ?? 0
          const idf = Math.log(1 + (n - df + 0.5) / (df + 0.5))
          score += (idf * (tf * (k1 + 1))) / (tf + k1 * (1 - b + (b * e.length) / (this.avgLength || 1)))
        }
        return { score, doc: e.doc }
      })
      .filter((r) => r.score > 0)
      .sort((a, b2) => b2.score - a.score)
      .slice(0, k)
      .map((r) => r.doc)
  }
}

declare global {
  var __keywordIndex: KeywordIndex | undefined
}

export function chunkText(text: string, size = 500, overlap = 50): string[] {
  const chunks: string[] = []
  let start = 0
  while (start < text.length) {
    chunks.push(text.slice(start, start + size))
    start += size - overlap
  }
  return chunks
}

function loadKnowledgeBase(): Document[] {
  const kbDir = path.join(process.cwd(), 'docs', 'knowledge-base')
  const docs: Document[] = []
  try {
    const files = fs.readdirSync(kbDir).filter((f) => f.endsWith('.md'))
    for (const file of files) {
      const content = fs.readFileSync(path.join(kbDir, file), 'utf-8')
      chunkText(content).forEach((chunk) =>
        docs.push(new Document({ pageContent: chunk, metadata: { source: file } }))
      )
    }
  } catch {
    // knowledge base directory not available
  }
  return docs
}

export async function getVectorStore(): Promise<KeywordIndex> {
  if (global.__keywordIndex) return global.__keywordIndex
  const index = new KeywordIndex()
  index.addDocuments(loadKnowledgeBase())
  global.__keywordIndex = index
  return index
}

export { PERSONA_SOURCE }
