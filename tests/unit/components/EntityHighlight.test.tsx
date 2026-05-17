import React from 'react'
import { render, screen } from '@testing-library/react'
import EntityHighlight from '@/components/chat/EntityHighlight'
import type { Entity } from '@/types/chat'

describe('EntityHighlight', () => {
  test('renders plain text when no entities', () => {
    render(<EntityHighlight text="Hello world" entities={[]} />)
    expect(screen.getByText('Hello world')).toBeInTheDocument()
  })

  test('highlights a PERSON entity', () => {
    const entities: Entity[] = [{ text: 'Alice', type: 'PERSON' }]
    render(<EntityHighlight text="Hello Alice today" entities={entities} />)
    const highlighted = screen.getByText('Alice')
    expect(highlighted.tagName).toBe('MARK')
  })

  test('renders surrounding text as plain spans', () => {
    const entities: Entity[] = [{ text: 'Paris', type: 'PLACE' }]
    const { container } = render(
      <EntityHighlight text="I visited Paris last year" entities={entities} />
    )
    const spans = container.querySelectorAll('span')
    expect(Array.from(spans).some((s) => s.textContent?.includes('I visited'))).toBe(true)
    expect(Array.from(spans).some((s) => s.textContent?.includes('last year'))).toBe(true)
  })

  test('handles entity not found in text gracefully', () => {
    const entities: Entity[] = [{ text: 'Unknown', type: 'CONCEPT' }]
    render(<EntityHighlight text="No match here" entities={entities} />)
    expect(screen.getByText('No match here')).toBeInTheDocument()
  })
})
