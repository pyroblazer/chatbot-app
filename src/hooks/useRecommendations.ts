'use client'

import { useState, useCallback } from 'react'
import type { Message } from '@/types/chat'

export function useRecommendations() {
  const [recommendations, setRecommendations] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRecommendations = useCallback(async (messages: Message[]) => {
    if (messages.length < 2) return
    setLoading(true)
    try {
      const last3 = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: last3 }),
      })
      if (res.ok) {
        const data = await res.json()
        setRecommendations(data.recommendations ?? [])
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }, [])

  return { recommendations, loading, fetchRecommendations }
}
