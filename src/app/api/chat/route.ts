import { NextRequest } from 'next/server'
import { streamChat } from '@/lib/langchain/chain'
import { sanitizeInput } from '@/lib/utils'
import type { PersonaId } from '@/types/chat'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const message = sanitizeInput(String(body.message ?? ''))
    const sessionId = String(body.sessionId ?? 'default')
    const persona = (body.persona as PersonaId) ?? 'productivity'

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: 'GROQ_API_KEY not configured' }, { status: 500 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(message, sessionId, persona)) {
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (err) {
          controller.enqueue(
            encoder.encode(`\nError: ${err instanceof Error ? err.message : 'Unknown error'}`)
          )
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
        'Cache-Control': 'no-cache',
      },
    })
  } catch (err) {
    console.error('[chat route]', err)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
