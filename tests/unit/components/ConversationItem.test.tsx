import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import ConversationItem from '@/components/sidebar/ConversationItem'
import type { Conversation } from '@/types/chat'

function makeConv(overrides: Partial<Conversation> = {}): Conversation {
  return {
    id: 'conv1',
    title: 'Test Chat',
    persona: 'productivity',
    messages: [],
    sessionId: 'sess1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('ConversationItem', () => {
  test('renders conversation title', () => {
    render(
      <ConversationItem
        conversation={makeConv()}
        isActive={false}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onRename={jest.fn()}
      />
    )
    expect(screen.getByText('Test Chat')).toBeInTheDocument()
  })

  test('calls onSelect when clicked', () => {
    const onSelect = jest.fn()
    render(
      <ConversationItem
        conversation={makeConv()}
        isActive={false}
        onSelect={onSelect}
        onDelete={jest.fn()}
        onRename={jest.fn()}
      />
    )
    fireEvent.click(screen.getByText('Test Chat'))
    expect(onSelect).toHaveBeenCalled()
  })

  test('calls onDelete when delete button is clicked', () => {
    const onDelete = jest.fn()
    render(
      <ConversationItem
        conversation={makeConv()}
        isActive={false}
        onSelect={jest.fn()}
        onDelete={onDelete}
        onRename={jest.fn()}
      />
    )
    fireEvent.click(screen.getByLabelText('Delete'))
    expect(onDelete).toHaveBeenCalled()
  })

  test('enters edit mode on rename click and calls onRename on Enter', () => {
    const onRename = jest.fn()
    render(
      <ConversationItem
        conversation={makeConv()}
        isActive={false}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onRename={onRename}
      />
    )
    fireEvent.click(screen.getByLabelText('Rename'))
    const input = screen.getByRole('textbox') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'New Title' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    expect(onRename).toHaveBeenCalledWith('New Title')
  })

  test('cancels rename on Escape', () => {
    const onRename = jest.fn()
    render(
      <ConversationItem
        conversation={makeConv()}
        isActive={false}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onRename={onRename}
      />
    )
    fireEvent.click(screen.getByLabelText('Rename'))
    const input = screen.getByRole('textbox')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(onRename).not.toHaveBeenCalled()
    expect(screen.getByText('Test Chat')).toBeInTheDocument()
  })

  test('applies active styles when isActive is true', () => {
    const { container } = render(
      <ConversationItem
        conversation={makeConv()}
        isActive={true}
        onSelect={jest.fn()}
        onDelete={jest.fn()}
        onRename={jest.fn()}
      />
    )
    expect(container.firstChild).toHaveClass('bg-cyan-500/15')
  })
})
