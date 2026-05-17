'use client'

import { useChatStore } from '@/stores/chatStore'
import ConversationItem from './ConversationItem'
import { MessageSquarePlus } from 'lucide-react'

export default function ConversationList() {
  const { conversations, activeId, createConversation, deleteConversation, setActive, renameConversation } =
    useChatStore()

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

      {conversations.length === 0 ? (
        <p className="text-xs text-gray-600 text-center py-4">No conversations yet</p>
      ) : (
        conversations.map((conv) => (
          <ConversationItem
            key={conv.id}
            conversation={conv}
            isActive={conv.id === activeId}
            onSelect={() => setActive(conv.id)}
            onDelete={() => deleteConversation(conv.id)}
            onRename={(title) => renameConversation(conv.id, title)}
          />
        ))
      )}
    </div>
  )
}
