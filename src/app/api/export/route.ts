import { NextRequest } from 'next/server'
import type { Message } from '@/types/chat'

export async function POST(req: NextRequest) {
  try {
    const { messages, format } = await req.json() as { messages: Message[]; format: 'json' | 'txt' }

    if (format === 'json') {
      const content = JSON.stringify(messages, null, 2)
      return new Response(content, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': 'attachment; filename="chat-export.json"',
        },
      })
    }

    const content = messages
      .map((m) => `[${new Date(m.timestamp).toLocaleString()}] ${m.role.toUpperCase()}: ${m.content}`)
      .join('\n\n')

    return new Response(content, {
      headers: {
        'Content-Type': 'text/plain',
        'Content-Disposition': 'attachment; filename="chat-export.txt"',
      },
    })
  } catch {
    return Response.json({ error: 'Export failed' }, { status: 500 })
  }
}
