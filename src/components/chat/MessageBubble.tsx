'use client'

import type { Message } from '@/types/chat'
import { formatTime } from '@/lib/utils'
import SentimentBadge from './SentimentBadge'
import EntityHighlight from './EntityHighlight'
import TypingIndicator from './TypingIndicator'
import ReactMarkdown from 'react-markdown'
import { useState } from 'react'
import { Pencil, RefreshCw, Copy, Check } from 'lucide-react'

interface Props {
  message: Message
  isLast?: boolean
  disabled?: boolean
  onRegenerate?: () => void
  onEdit?: (messageId: string, newText: string) => void
}

export default function MessageBubble({ message, isLast = false, disabled = false, onRegenerate, onEdit }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(message.content)
  const [copied, setCopied] = useState(false)
  const isUser = message.role === 'user'
  const isStreaming = message.isStreaming && message.role === 'assistant'

  if (isStreaming && !message.content) {
    return (
      <div className="flex justify-start mb-4">
        <div className="bg-[#12121a] border border-cyan-500/30 rounded-2xl rounded-tl-sm max-w-[80%]">
          <TypingIndicator />
        </div>
      </div>
    )
  }

  return (
    <div className={`flex mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-purple-900/60 border border-purple-500/50 rounded-tr-sm text-white'
            : 'bg-[#12121a] border border-cyan-500/30 rounded-tl-sm text-gray-100'
        }`}
      >
        {isUser && editing ? (
          <div className="flex flex-col gap-2">
            <textarea
              aria-label="Edit message"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              className="w-full bg-black/30 border border-white/20 rounded-lg p-2 text-sm text-white"
              rows={3}
            />
            <div className="flex gap-2 justify-end text-xs">
              <button onClick={() => { setEditing(false); setDraft(message.content) }} className="text-gray-400 hover:text-white">Cancel</button>
              <button
                onClick={() => { setEditing(false); if (draft.trim()) onEdit?.(message.id, draft.trim()) }}
                className="text-cyan-300 hover:text-cyan-100"
              >
                Save &amp; resend
              </button>
            </div>
          </div>
        ) : isUser ? (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
        ) : (
          <div className="text-sm leading-relaxed prose prose-invert prose-sm max-w-none">
            <ReactMarkdown
              components={{
                p: ({ children }) => {
                  const text = typeof children === 'string' ? children : ''
                  const entities = message.nlp?.entities ?? []
                  return (
                    <p className="mb-2 last:mb-0">
                      {text && entities.length ? (
                        <EntityHighlight text={text} entities={entities} />
                      ) : (
                        children
                      )}
                    </p>
                  )
                },
                code: ({ children, className }) => {
                  const isBlock = className?.includes('language-')
                  return isBlock ? (
                    <code className="block bg-black/40 border border-white/10 rounded p-3 text-xs font-mono overflow-x-auto text-cyan-300">
                      {children}
                    </code>
                  ) : (
                    <code className="bg-black/40 px-1 py-0.5 rounded text-xs text-cyan-300">
                      {children}
                    </code>
                  )
                },
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        )}

        <div className={`flex items-center gap-2 mt-2 ${isUser ? 'justify-end' : 'justify-start'}`}>
          <span className="text-xs text-gray-500">{formatTime(new Date(message.timestamp))}</span>
          {message.nlp && <SentimentBadge sentiment={message.nlp.sentiment} />}
          {!isStreaming && !editing && (
            <span className="flex items-center gap-2 text-gray-500">
              {!isUser && (
                <button
                  aria-label="Copy message"
                  onClick={() => {
                    void navigator.clipboard?.writeText(message.content)
                    setCopied(true)
                    setTimeout(() => setCopied(false), 1500)
                  }}
                  className="hover:text-gray-200"
                >
                  {copied ? <Check size={12} /> : <Copy size={12} />}
                </button>
              )}
              {isUser && onEdit && (
                <button aria-label="Edit message" disabled={disabled} onClick={() => setEditing(true)} className="hover:text-gray-200 disabled:opacity-40">
                  <Pencil size={12} />
                </button>
              )}
              {!isUser && isLast && onRegenerate && (
                <button aria-label="Regenerate response" disabled={disabled} onClick={onRegenerate} className="hover:text-gray-200 disabled:opacity-40">
                  <RefreshCw size={12} />
                </button>
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
