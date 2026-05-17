'use client'

import dynamic from 'next/dynamic'

// Render the entire chat UI client-only to avoid SSR/hydration mismatches
// (Zustand localStorage, crypto.randomUUID, Three.js all require the browser)
const ChatUI = dynamic(() => import('@/components/chat/ChatUI'), { ssr: false })

export default function ChatPage() {
  return <ChatUI />
}
