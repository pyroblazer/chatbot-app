'use client'

import { useState, useRef, useEffect, KeyboardEvent, useCallback } from 'react'
import { Send, Square } from 'lucide-react'

interface Props {
  onSend: (message: string) => void
  onCancel: () => void
  isStreaming: boolean
  fillText?: string
  onFillConsumed?: () => void
}

const MAX_CHARS = 2000

export default function InputBar({ onSend, onCancel, isStreaming, fillText, onFillConsumed }: Props) {
  const [value, setValue] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!fillText) return
    const ta = textareaRef.current
    if (ta) {
      // Use nativeInputValueSetter to trigger React's synthetic onChange, avoiding
      // calling setState directly inside an effect body (react-hooks/set-state-in-effect).
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value'
      )?.set
      nativeInputValueSetter?.call(ta, fillText)
      ta.dispatchEvent(new Event('input', { bubbles: true }))
      ta.focus()
    }
    onFillConsumed?.()
  }, [fillText, onFillConsumed])

  const handleSend = useCallback(() => {
    const trimmed = value.trim()
    if (!trimmed || isStreaming) return
    onSend(trimmed)
    setValue('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'
  }, [value, isStreaming, onSend])

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      handleSend()
    }
  }

  const handleInput = () => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`
  }

  const remaining = MAX_CHARS - value.length

  return (
    <div className="border-t border-white/10 bg-[#0a0a0f]/80 backdrop-blur-md p-4">
      <div className="max-w-4xl mx-auto flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX_CHARS))}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isStreaming}
            placeholder="Type a message… (Ctrl+Enter to send)"
            rows={1}
            aria-label="Message input"
            className="w-full bg-[#12121a] border border-white/20 focus:border-cyan-500/60 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 resize-none outline-none transition-colors disabled:opacity-50"
            style={{ minHeight: '48px', maxHeight: '160px' }}
          />
          <span
            className={`absolute bottom-2 right-3 text-xs ${remaining < 100 ? 'text-orange-400' : 'text-gray-600'}`}
          >
            {remaining}
          </span>
        </div>

        {isStreaming ? (
          <button
            onClick={onCancel}
            aria-label="Stop generation"
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-red-900/50 border border-red-500/50 flex items-center justify-center text-red-400 hover:bg-red-900/70 transition-colors"
          >
            <Square size={18} />
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!value.trim()}
            aria-label="Send message"
            className="flex-shrink-0 w-12 h-12 rounded-xl bg-cyan-600/80 border border-cyan-400/50 flex items-center justify-center text-white hover:bg-cyan-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send size={18} />
          </button>
        )}
      </div>
      <p className="text-center text-xs text-gray-600 mt-2">
        AI may make mistakes. Verify important information.
      </p>
    </div>
  )
}
