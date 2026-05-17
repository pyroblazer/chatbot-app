import React from 'react'
import { render, screen } from '@testing-library/react'
import TypingIndicator from '@/components/chat/TypingIndicator'

describe('TypingIndicator', () => {
  test('renders with aria-label', () => {
    render(<TypingIndicator />)
    expect(screen.getByLabelText('AI is typing')).toBeInTheDocument()
  })

  test('renders three animated dots', () => {
    const { container } = render(<TypingIndicator />)
    const dots = container.querySelectorAll('.animate-bounce')
    expect(dots.length).toBe(3)
  })
})
