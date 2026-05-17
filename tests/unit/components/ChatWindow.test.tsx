import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ChatWindow from '@/components/chat/ChatWindow'
import type { Message } from '@/types/chat'

const mockOnPromptClick = jest.fn()

function makeMsg(overrides: Partial<Message> = {}): Message {
  return {
    id: '1',
    role: 'user',
    content: 'Hello',
    timestamp: new Date().toISOString(),
    ...overrides,
  }
}

describe('ChatWindow', () => {
  beforeEach(() => mockOnPromptClick.mockClear())

  test('shows empty state with AI Assistant heading when no messages', () => {
    render(<ChatWindow messages={[]} onPromptClick={mockOnPromptClick} />)
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
  })

  test('renders example prompt buttons in empty state', () => {
    render(<ChatWindow messages={[]} onPromptClick={mockOnPromptClick} />)
    // buttons render with curly-quote HTML entities around the text
    const btn = screen.getByRole('button', { name: (name) => name.includes('Plan my week') })
    expect(btn).toBeInTheDocument()
  })

  test('calls onPromptClick when example prompt is clicked', () => {
    render(<ChatWindow messages={[]} onPromptClick={mockOnPromptClick} />)
    const btn = screen.getByRole('button', { name: (name) => name.includes('Plan my week') })
    fireEvent.click(btn)
    expect(mockOnPromptClick).toHaveBeenCalledWith('Plan my week')
  })

  test('renders message log when messages exist', () => {
    const msgs = [makeMsg({ content: 'Hello there' })]
    render(<ChatWindow messages={msgs} onPromptClick={mockOnPromptClick} />)
    expect(screen.getByRole('log')).toBeInTheDocument()
    expect(screen.getByText('Hello there')).toBeInTheDocument()
  })

  test('does not show empty state when messages exist', () => {
    const msgs = [makeMsg()]
    render(<ChatWindow messages={msgs} onPromptClick={mockOnPromptClick} />)
    expect(screen.queryByText('AI Assistant')).not.toBeInTheDocument()
  })
})
