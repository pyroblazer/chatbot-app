'use client'

import { useState, useRef, useEffect } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import type { Conversation } from '@/types/chat'

interface Props {
  conversation: Conversation
  isActive: boolean
  onSelect: () => void
  onDelete: () => void
  onRename: (title: string) => void
}

export default function ConversationItem({ conversation, isActive, onSelect, onDelete, onRename }: Props) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(conversation.title)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) inputRef.current?.focus()
  }, [editing])

  function commitRename() {
    const trimmed = draft.trim()
    if (trimmed && trimmed !== conversation.title) onRename(trimmed)
    setEditing(false)
  }

  function cancelRename() {
    setDraft(conversation.title)
    setEditing(false)
  }

  return (
    <div
      className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-cyan-500/15 border border-cyan-500/40 text-cyan-200'
          : 'border border-transparent text-gray-400 hover:bg-white/5 hover:text-gray-200'
      }`}
      onClick={() => !editing && onSelect()}
    >
      {editing ? (
        <div className="flex-1 flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <input
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename()
              if (e.key === 'Escape') cancelRename()
            }}
            className="flex-1 bg-transparent border-b border-cyan-500/60 text-sm text-gray-200 outline-none py-0.5 min-w-0"
          />
          <button onClick={commitRename} className="text-cyan-400 hover:text-cyan-200 shrink-0">
            <Check size={13} />
          </button>
          <button onClick={cancelRename} className="text-gray-500 hover:text-gray-300 shrink-0">
            <X size={13} />
          </button>
        </div>
      ) : (
        <>
          <span className="flex-1 text-sm truncate">{conversation.title}</span>
          <div
            className="hidden group-hover:flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => { setDraft(conversation.title); setEditing(true) }}
              className="text-gray-500 hover:text-gray-200 p-0.5"
              aria-label="Rename"
            >
              <Pencil size={12} />
            </button>
            <button
              onClick={onDelete}
              className="text-gray-500 hover:text-red-400 p-0.5"
              aria-label="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  )
}
