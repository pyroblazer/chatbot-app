'use client'

import type { SentimentResult } from '@/types/chat'
import { SENTIMENT_EMOJI, SENTIMENT_COLOR } from '@/constants/colors'

interface Props {
  sentiment: SentimentResult
}

export default function SentimentBadge({ sentiment }: Props) {
  const emoji = SENTIMENT_EMOJI[sentiment.label] ?? '😐'
  const color = SENTIMENT_COLOR[sentiment.label] ?? '#ffd700'
  const pct = Math.round(sentiment.score * 100)

  return (
    <span
      title={`${sentiment.label} (${pct}%)`}
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border"
      style={{ borderColor: color, color, background: `${color}18` }}
    >
      {emoji} <span className="font-medium">{sentiment.label}</span>
    </span>
  )
}
