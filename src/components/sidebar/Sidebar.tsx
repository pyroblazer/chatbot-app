'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ConversationList from './ConversationList'
import PersonaSelector from './PersonaSelector'
import RecommendationPanel from './RecommendationPanel'
import ExportButton from './ExportButton'
import { useChatStore, selectActiveConversation } from '@/stores/chatStore'

interface Props {
  recommendations: string[]
  loadingRecs: boolean
  onSelectRecommendation: (text: string) => void
}

export default function Sidebar({ recommendations, loadingRecs, onSelectRecommendation }: Props) {
  const [collapsed, setCollapsed] = useState(false)
  const store = useChatStore()
  const activeConv = selectActiveConversation(store)

  return (
    <aside
      className={`relative flex flex-col border-r border-white/10 bg-[#0a0a0f]/70 backdrop-blur-md transition-all duration-300 ${
        collapsed ? 'w-12' : 'w-72'
      }`}
    >
      <button
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className="absolute -right-3 top-6 z-10 w-6 h-6 rounded-full bg-[#1a1a2e] border border-white/20 flex items-center justify-center text-gray-400 hover:text-gray-200"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>

      {!collapsed && (
        <div className="flex-1 flex flex-col gap-5 p-4 overflow-y-auto">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-sm font-bold text-cyan-400 tracking-wide">AI Chatbot</h1>
              <span className="text-xs text-gray-600">v1.0</span>
            </div>
            <p className="text-xs text-gray-600">Powered by Groq + LangChain</p>
          </div>

          <ConversationList />

          {activeConv && (
            <>
              <PersonaSelector />

              <RecommendationPanel
                recommendations={recommendations}
                loading={loadingRecs}
                onSelect={onSelectRecommendation}
              />

              <div className="mt-auto">
                <ExportButton messages={activeConv.messages} />
              </div>
            </>
          )}
        </div>
      )}
    </aside>
  )
}
