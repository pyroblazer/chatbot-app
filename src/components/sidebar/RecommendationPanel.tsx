'use client'

import { Sparkles } from 'lucide-react'

interface Props {
  recommendations: string[]
  loading: boolean
  onSelect: (text: string) => void
}

export default function RecommendationPanel({ recommendations, loading, onSelect }: Props) {
  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-1">
        <Sparkles size={12} />
        Suggestions
      </h3>
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 bg-white/5 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : recommendations.length > 0 ? (
        <div className="space-y-2">
          {recommendations.map((rec, i) => (
            <button
              key={i}
              onClick={() => onSelect(rec)}
              className="w-full text-left text-xs p-2.5 rounded-lg border border-purple-500/20 bg-purple-500/5 text-purple-300 hover:border-purple-500/40 hover:bg-purple-500/10 transition-all leading-tight"
            >
              {rec}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-xs text-gray-600">Send a message to get suggestions.</p>
      )}
    </div>
  )
}
