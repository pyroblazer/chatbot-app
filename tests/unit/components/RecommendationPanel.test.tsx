import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import RecommendationPanel from '@/components/sidebar/RecommendationPanel'

describe('RecommendationPanel', () => {
  test('shows placeholder text when no recommendations and not loading', () => {
    render(<RecommendationPanel recommendations={[]} loading={false} onSelect={jest.fn()} />)
    expect(screen.getByText('Send a message to get suggestions.')).toBeInTheDocument()
  })

  test('shows loading skeletons when loading', () => {
    const { container } = render(
      <RecommendationPanel recommendations={[]} loading={true} onSelect={jest.fn()} />
    )
    expect(container.querySelectorAll('.animate-pulse').length).toBe(3)
  })

  test('renders recommendation buttons', () => {
    const recs = ['How do I focus?', 'What is GTD?']
    render(<RecommendationPanel recommendations={recs} loading={false} onSelect={jest.fn()} />)
    expect(screen.getByText('How do I focus?')).toBeInTheDocument()
    expect(screen.getByText('What is GTD?')).toBeInTheDocument()
  })

  test('calls onSelect with the recommendation text when clicked', () => {
    const onSelect = jest.fn()
    render(
      <RecommendationPanel
        recommendations={['Tell me more']}
        loading={false}
        onSelect={onSelect}
      />
    )
    fireEvent.click(screen.getByText('Tell me more'))
    expect(onSelect).toHaveBeenCalledWith('Tell me more')
  })
})
