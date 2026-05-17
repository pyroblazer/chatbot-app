'use client'

import { PERSONAS } from '@/constants/personas'
import type { PersonaId } from '@/types/chat'
import { useChatStore, selectActiveConversation } from '@/stores/chatStore'

export default function PersonaSelector() {
  const store = useChatStore()
  const activeConv = selectActiveConversation(store)

  if (!activeConv) return null

  const currentPersona = activeConv.persona

  function handleSelect(id: PersonaId) {
    store.setPersonaForConversation(activeConv!.id, id)
  }

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Bot Persona
      </h3>
      <div className="space-y-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            onClick={() => handleSelect(p.id as PersonaId)}
            className={`w-full text-left p-3 rounded-xl border transition-all ${
              currentPersona === p.id
                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-300'
                : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/20 hover:text-gray-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{p.icon}</span>
              <div>
                <div className="text-sm font-medium">{p.name}</div>
                <div className="text-xs text-gray-500 mt-0.5 leading-tight">{p.description}</div>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
