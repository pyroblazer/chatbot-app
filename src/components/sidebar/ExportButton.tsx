'use client'

import { useState } from 'react'
import { Download } from 'lucide-react'
import type { Message } from '@/types/chat'

interface Props {
  messages: Message[]
}

export default function ExportButton({ messages }: Props) {
  const [open, setOpen] = useState(false)

  const exportChat = async (format: 'json' | 'txt') => {
    setOpen(false)
    const res = await fetch('/api/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages, format }),
    })
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-export.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (messages.length === 0) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20 transition-colors text-sm"
      >
        <Download size={14} />
        Export Chat
      </button>
      {open && (
        <div className="absolute bottom-full mb-1 left-0 right-0 bg-[#1a1a2e] border border-white/20 rounded-lg overflow-hidden shadow-xl">
          {(['json', 'txt'] as const).map((f) => (
            <button
              key={f}
              onClick={() => exportChat(f)}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-white/10 transition-colors uppercase"
            >
              {f}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
