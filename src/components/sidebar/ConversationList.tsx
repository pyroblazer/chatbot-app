'use client'

import { useChatStore } from '@/stores/chatStore'
import ConversationItem from './ConversationItem'
import { MessageSquarePlus, Search } from 'lucide-react'
import { useState } from 'react'
import { searchConversations } from '@/lib/search'

export default function ConversationList() {
  const { conversations, activeId, createConversation, deleteConversation, setActive, renameConversation } =
    useChatStore()

  const [query, setQuery] = useState('')
  const hits = searchConversations(conversations, query)

  function handleNew() {
    createConversation()
  }

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Chats</span>
        <button
          onClick={handleNew}
          aria-label="New chat"
          className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-200 transition-colors"
        >
          <MessageSquarePlus size={14} />
          New
        </button>
      </div>

      {conversations.length > 1 && (
        <label className="flex items-center gap-2 mb-2 px-2 py-1 rounded-lg bg-white/5 border border-white/10">
          <Search size={12} className="text-gray-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats…"
            aria-label="Search conversations"
            className="bg-transparent text-xs text-gray-200 placeholder-gray-600 outline-none w-full"
          />
        </label>
      )}

      {conversations.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">No conversations yet</p>
      ) : (
        hits.length === 0 ? (
          <p className="text-xs text-gray-600 text-center py-4">No matches</p>
        ) : hits.map(({ conversation: conv, snippet }) => (
          <div key={conv.id}>
          <ConversationItem
            conversation={conv}
            isActive={conv.id === activeId}
            onSelect={() => setActive(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
            onRename={(title) => renameConversation(conv.id, title)}
          />
          {query && snippet && snippet !== conv.title && (
            <p className="text-[11px] text-gray-500 px-3 pb-1 truncate">{snippet}</p>
          )}
          </div>
        ))
      )}
    </div>
  )
}
