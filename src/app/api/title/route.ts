import { NextRequest } from 'next/server'
import { getGroqModel } from '@/lib/groq'
import { HumanMessage } from '@langchain/core/messages'
import { rateLimit, clientKey, cleanMessages } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`aux:${clientKey(req)}`, 30)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }
    const messages = cleanMessages((await req.json()).messages, 20)
    if (messages.length === 0) {
      return Response.json({ title: 'New Chat' })
    }

    const context = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n')

    const model = getGroqModel()
    const response = await model.invoke([
      new HumanMessage(
        `Summarize the following conversation into a short chat title (5 words or fewer, no punctuation, no quotes). Return ONLY the title, nothing else.\n\nConversation:\n${context}`
      ),
    ])

    const raw = typeof response.content === 'string' ? response.content.trim() : ''
    const title = raw.replace(/^["']|["']$/g, '').slice(0, 50) || 'New Chat'
    return Response.json({ title })
  } catch (err) {
    console.error('[title route]', err)
    return Response.json({ title: 'New Chat' })
  }
}
