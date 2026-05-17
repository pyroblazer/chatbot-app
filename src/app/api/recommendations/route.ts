import { NextRequest } from 'next/server'
import { getGroqModel } from '@/lib/groq'
import { HumanMessage } from '@langchain/core/messages'

export const runtime = 'nodejs'
export const maxDuration = 15

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json({ recommendations: [] })
    }

    const context = messages
      .map((m: { role: string; content: string }) => `${m.role}: ${m.content}`)
      .join('\n')

    const model = getGroqModel()
    const response = await model.invoke([
      new HumanMessage(
        `Based on this conversation, suggest 3 short follow-up questions or actions the user might want to explore next. Return ONLY a JSON array of 3 strings, nothing else.\n\nConversation:\n${context}`
      ),
    ])

    const text = typeof response.content === 'string' ? response.content : ''
    const match = text.match(/\[[\s\S]*\]/)
    let recommendations: string[] = []
    if (match) {
      try {
        recommendations = JSON.parse(match[0])
      } catch {
        recommendations = []
      }
    }

    return Response.json({ recommendations: recommendations.slice(0, 3) })
  } catch (err) {
    console.error('[recommendations route]', err)
    return Response.json({ recommendations: [] })
  }
}
