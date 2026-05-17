'use client'

import type { Message } from '@/types/chat'
import { formatTime } from '@/lib/utils'
import SentimentBadge from './SentimentBadge'
import EntityHighlight from './EntityHighlight'
import TypingIndicator from './TypingIndicator'
import ReactMarkdown from 'react-markdown'

interface Props {
  message: Message
}

export default function MessageBubble({ message }: Props) {
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
        {isUser ? (
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
        </div>
      </div>
    </div>
  )
}
