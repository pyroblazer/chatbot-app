import { Document } from '@langchain/core/documents'
import { Embeddings } from '@langchain/core/embeddings'
import type { PersonaId } from '@/types/chat'
import path from 'path'
import fs from 'fs'

interface SimpleVectorEntry {
  vector: number[]
  doc: Document
}

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

class SimpleVectorStore {
  private entries: SimpleVectorEntry[] = []

  constructor(private embeddings: SimpleEmbeddings) {}

  async addDocuments(docs: Document[]): Promise<void> {
    const vectors = await this.embeddings.embedDocuments(docs.map((d) => d.pageContent))
    for (let i = 0; i < docs.length; i++) {
      this.entries.push({ vector: vectors[i], doc: docs[i] })
    }
  }

  async similaritySearch(query: string, k = 3, sourceFile?: string): Promise<Document[]> {
    if (this.entries.length === 0) return []
    const pool = sourceFile
      ? this.entries.filter((e) => e.doc.metadata.source === sourceFile)
      : this.entries
    if (pool.length === 0) return []

    const queryVec = await this.embeddings.embedQuery(query)
    const scored = pool.map((e) => ({
      score: cosineSim(queryVec, e.vector),
      doc: e.doc,
    }))
    scored.sort((a, b) => b.score - a.score)
    return scored.slice(0, k).map((s) => s.doc)
  }
}

function cosineSim(a: number[], b: number[]): number {
  let dot = 0, magA = 0, magB = 0
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i]
    magA += a[i] * a[i]
    magB += b[i] * b[i]
  }
  return dot / (Math.sqrt(magA) * Math.sqrt(magB) || 1)
}

class SimpleEmbeddings extends Embeddings {
  constructor() { super({}) }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return texts.map((t) => this.textToVector(t))
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.textToVector(text)
  }

  private textToVector(text: string): number[] {
    const vec = new Array(128).fill(0)
    const lower = text.toLowerCase()
    for (let i = 0; i < lower.length; i++) {
      vec[i % 128] += lower.charCodeAt(i) / 1000
    }
    const mag = Math.sqrt(vec.reduce((s, v) => s + v * v, 0)) || 1
    return vec.map((v) => v / mag)
  }
}

declare global {
  var __vectorStore: SimpleVectorStore | undefined
}

function chunkText(text: string, size = 500, overlap = 50): string[] {
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

export async function getVectorStore(): Promise<SimpleVectorStore> {
  if (global.__vectorStore) return global.__vectorStore
  const embeddings = new SimpleEmbeddings()
  const store = new SimpleVectorStore(embeddings)
  const docs = loadKnowledgeBase()
  if (docs.length > 0) await store.addDocuments(docs)
  global.__vectorStore = store
  return global.__vectorStore
}

export { PERSONA_SOURCE }
