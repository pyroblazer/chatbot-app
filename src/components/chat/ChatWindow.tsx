'use client'

import { useEffect, useRef } from 'react'
import type { Message } from '@/types/chat'
import MessageBubble from './MessageBubble'

const EXAMPLE_PROMPTS = [
  'Plan my week',
  'Explain React hooks',
  'Best places in Bali',
  'Fix this bug for me',
]

interface Props {
  messages: Message[]
  onPromptClick: (text: string) => void
}

export default function ChatWindow({ messages, onPromptClick }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
        <div className="text-6xl mb-4">🤖</div>
        <h2 className="text-2xl font-bold text-cyan-400 mb-2">AI Assistant</h2>
        <p className="text-gray-400 max-w-md">
          Your intelligent companion powered by LLM. Ask anything - I&apos;ll help with
          productivity, customer service, education, travel, or coding.
        </p>
        <div className="mt-6 grid grid-cols-2 gap-2 text-sm">
          {EXAMPLE_PROMPTS.map((hint) => (
            <button
              key={hint}
              onClick={() => onPromptClick(hint)}
              className="border border-gray-700 rounded-lg px-3 py-2 text-gray-400 hover:border-cyan-500/60 hover:text-cyan-300 hover:bg-cyan-500/5 transition-all text-left cursor-pointer"
            >
              &ldquo;{hint}&rdquo;
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1" role="log" aria-label="Chat messages">
      {messages.map((msg) => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
