import { render, screen } from '@testing-library/react'
import SentimentBadge from '@/components/chat/SentimentBadge'

describe('SentimentBadge', () => {
  it('renders positive sentiment with correct emoji', () => {
    render(<SentimentBadge sentiment={{ label: 'positive', score: 0.9 }} />)
    expect(screen.getByText(/😊/)).toBeInTheDocument()
    expect(screen.getByText(/positive/)).toBeInTheDocument()
  })

  it('renders negative sentiment with correct emoji', () => {
    render(<SentimentBadge sentiment={{ label: 'negative', score: 0.8 }} />)
    expect(screen.getByText(/😟/)).toBeInTheDocument()
  })

  it('renders neutral sentiment with correct emoji', () => {
    render(<SentimentBadge sentiment={{ label: 'neutral', score: 0.5 }} />)
    expect(screen.getByText(/😐/)).toBeInTheDocument()
  })

  it('shows score percentage in title', () => {
    render(<SentimentBadge sentiment={{ label: 'positive', score: 0.85 }} />)
    const badge = screen.getByTitle(/85%/)
    expect(badge).toBeInTheDocument()
  })
})
