import { NextRequest } from 'next/server'
import { streamChat } from '@/lib/langchain/chain'
import { sanitizeInput } from '@/lib/utils'
import type { PersonaId } from '@/types/chat'
import { PERSONAS } from '@/constants/personas'
import { rateLimit, clientKey, cleanMessages } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

export async function POST(req: NextRequest) {
  try {
    if (!rateLimit(`chat:${clientKey(req)}`, 20)) {
      return Response.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const message = sanitizeInput(String(body.message ?? ''))
    const sessionId = String(body.sessionId ?? 'default').slice(0, 100)
    const requestedPersona = body.persona ?? 'productivity'
    if (!PERSONAS.some((p) => p.id === requestedPersona)) {
      return Response.json({ error: 'Unknown persona' }, { status: 400 })
    }
    const persona = requestedPersona as PersonaId
    const history = Array.isArray(body.history) ? cleanMessages(body.history, 20) : undefined

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      return Response.json({ error: 'Service unavailable' }, { status: 503 })
    }

    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamChat(message, sessionId, persona, history, req.signal)) {
            controller.enqueue(encoder.encode(chunk))
          }
        } catch (err) {
          console.error("[chat stream]", err)
          controller.enqueue(
            encoder.encode('\nSomething went wrong while generating the response.')
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
