import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import InputBar from '@/components/chat/InputBar'

describe('InputBar', () => {
  const mockSend = jest.fn()
  const mockCancel = jest.fn()

  beforeEach(() => {
    mockSend.mockClear()
    mockCancel.mockClear()
  })

  it('renders textarea and send button', () => {
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={false} />)
    expect(screen.getByRole('textbox')).toBeInTheDocument()
    expect(screen.getByLabelText('Send message')).toBeInTheDocument()
  })

  it('send button is disabled when textarea is empty', () => {
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={false} />)
    expect(screen.getByLabelText('Send message')).toBeDisabled()
  })

  it('calls onSend when send button clicked with text', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={false} />)
    await user.type(screen.getByRole('textbox'), 'Hello')
    await user.click(screen.getByLabelText('Send message'))
    expect(mockSend).toHaveBeenCalledWith('Hello')
  })

  it('shows stop button when streaming', () => {
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={true} />)
    expect(screen.getByLabelText('Stop generation')).toBeInTheDocument()
    expect(screen.queryByLabelText('Send message')).not.toBeInTheDocument()
  })

  it('calls onCancel when stop button clicked', async () => {
    const user = userEvent.setup()
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={true} />)
    await user.click(screen.getByLabelText('Stop generation'))
    expect(mockCancel).toHaveBeenCalled()
  })

  it('textarea is disabled when streaming', () => {
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={true} />)
    expect(screen.getByRole('textbox')).toBeDisabled()
  })

  it('submits on Ctrl+Enter', () => {
    render(<InputBar onSend={mockSend} onCancel={mockCancel} isStreaming={false} />)
    const textarea = screen.getByRole('textbox')
    fireEvent.change(textarea, { target: { value: 'Test message' } })
    fireEvent.keyDown(textarea, { key: 'Enter', ctrlKey: true })
    expect(mockSend).toHaveBeenCalledWith('Test message')
  })
})
