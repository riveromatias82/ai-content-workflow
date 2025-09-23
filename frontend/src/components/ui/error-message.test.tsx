import { render, screen } from '@/test-utils'
import { ErrorMessage } from './error-message'

describe('ErrorMessage', () => {
  it('renders error message with default title', () => {
    const error = new Error('Test error message')
    render(<ErrorMessage error={error} />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Test error message')).toBeInTheDocument()
    expect(screen.getByTestId('alert-circle-icon')).toBeInTheDocument()
  })

  it('renders with custom title', () => {
    const error = new Error('Test error')
    render(<ErrorMessage error={error} title="Custom Error Title" />)
    
    expect(screen.getByText('Custom Error Title')).toBeInTheDocument()
    expect(screen.getByText('Test error')).toBeInTheDocument()
  })

  it('renders with error object containing message property', () => {
    const error = { message: 'Custom error object message' }
    render(<ErrorMessage error={error} />)
    
    expect(screen.getByText('Custom error object message')).toBeInTheDocument()
  })

  it('renders with proper CSS classes for styling', () => {
    const error = new Error('Test error')
    const { container } = render(<ErrorMessage error={error} />)
    
    // Check for card styling
    const cardElement = container.querySelector('.card')
    expect(cardElement).toBeInTheDocument()
    
    // Check for proper flex layout
    const flexElement = container.querySelector('.flex.items-center.justify-center')
    expect(flexElement).toBeInTheDocument()
  })

  it('renders error icon with proper styling', () => {
    const error = new Error('Test error')
    render(<ErrorMessage error={error} />)
    
    const icon = screen.getByTestId('alert-circle-icon')
    expect(icon).toBeInTheDocument()
  })

  it('handles empty error message gracefully', () => {
    const error = new Error('')
    const { container } = render(<ErrorMessage error={error} />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    // Should render the empty message without crashing - check the paragraph element
    const messageElement = container.querySelector('p.text-gray-600')
    expect(messageElement).toBeInTheDocument()
    expect(messageElement?.textContent).toBe('')
  })

  it('handles undefined error message', () => {
    const error = { message: undefined }
    render(<ErrorMessage error={error} />)
    
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
  })

  it('renders with minimum height for consistent layout', () => {
    const error = new Error('Test error')
    const { container } = render(<ErrorMessage error={error} />)
    
    const minHeightElement = container.querySelector('.min-h-\\[200px\\]')
    expect(minHeightElement).toBeInTheDocument()
  })
})
