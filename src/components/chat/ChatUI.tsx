'use client'

import dynamic from 'next/dynamic'
import { useState, useEffect } from 'react'
import ChatWindow from './ChatWindow'
import InputBar from './InputBar'
import Sidebar from '@/components/sidebar/Sidebar'
import { useChat } from '@/hooks/useChat'
import { useRecommendations } from '@/hooks/useRecommendations'
import { useChatStore, selectActiveConversation } from '@/stores/chatStore'

const BackgroundScene = dynamic(() => import('@/components/three/BackgroundScene'), { ssr: false })

export default function ChatUI() {
  const store = useChatStore()
  const activeConv = selectActiveConversation(store)

  // Auto-create first conversation on mount
  useEffect(() => {
    if (store.conversations.length === 0) {
      store.createConversation()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const { messages, isStreaming, sendMessage, cancel } = useChat()
  const { recommendations, loading: loadingRecs, fetchRecommendations } = useRecommendations()
  const [fillText, setFillText] = useState<string | undefined>(undefined)

  useEffect(() => {
    const lastMsg = messages[messages.length - 1]
    if (lastMsg?.role === 'assistant' && !lastMsg.isStreaming) {
      fetchRecommendations(messages)
    }
  }, [messages, fetchRecommendations])

  return (
    <>
      <BackgroundScene />
      <div className="relative z-10 flex h-screen overflow-hidden">
        <Sidebar
          recommendations={recommendations}
          loadingRecs={loadingRecs}
          onSelectRecommendation={setFillText}
        />
        <main className="flex-1 flex flex-col min-w-0">
          {activeConv ? (
            <>
              <div className="flex items-center px-4 py-3 border-b border-white/10 bg-[#0a0a0f]/50 backdrop-blur-sm shrink-0">
                <span className="text-sm font-medium text-gray-300 truncate">{activeConv.title}</span>
              </div>
              <ChatWindow messages={messages} onPromptClick={setFillText} />
              <InputBar
                onSend={sendMessage}
                onCancel={cancel}
                isStreaming={isStreaming}
                fillText={fillText}
                onFillConsumed={() => setFillText(undefined)}
              />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-600 text-sm">
              Select or create a conversation to get started.
            </div>
          )}
        </main>
      </div>
    </>
  )
}
