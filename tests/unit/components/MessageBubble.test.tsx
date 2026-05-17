import React from 'react'
import { render, screen } from '@testing-library/react'
import MessageBubble from '@/components/chat/MessageBubble'
import type { Message } from '@/types/chat'

function makeMsg(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('MessageBubble', () => {
  test('renders user message content', () => {
    render(<MessageBubble message={makeMsg({ content: 'User says hi' })} />)
    expect(screen.getByText('User says hi')).toBeInTheDocument()
  })

  test('renders typing indicator when assistant is streaming with empty content', () => {
    render(
      <MessageBubble
        message={makeMsg({ role: 'assistant', content: '', isStreaming: true })}
      />
    )
    expect(screen.getByLabelText('AI is typing')).toBeInTheDocument()
  })

  test('renders assistant content when streaming with content', () => {
    render(
      <MessageBubble
        message={makeMsg({ role: 'assistant', content: 'Partial response', isStreaming: true })}
      />
    )
    expect(screen.getByText('Partial response')).toBeInTheDocument()
  })

  test('renders sentiment badge when nlp data is present', () => {
    render(
      <MessageBubble
        message={makeMsg({
          role: 'assistant',
          content: 'Great!',
          nlp: { intent: 'question', sentiment: { label: 'positive', score: 0.9 }, entities: [] },
        })}
      />
    )
    expect(screen.getByText(/😊/)).toBeInTheDocument()
  })

  test('renders timestamp', () => {
    render(<MessageBubble message={makeMsg()} />)
    // formatTime produces HH:MM
    expect(screen.getByText(/\d{2}:\d{2}/)).toBeInTheDocument()
  })
})
