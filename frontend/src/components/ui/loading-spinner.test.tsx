import { render, screen } from '@/test-utils'
import { LoadingSpinner } from './loading-spinner'

describe('LoadingSpinner', () => {
  it('renders with default medium size', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toBeInTheDocument()
    
    // Check for default medium size classes
    expect(spinner).toHaveClass('w-8', 'h-8')
  })

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-4', 'h-4')
  })

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-12', 'h-12')
  })

  it('renders with proper flex layout for centering', () => {
    const { container } = render(<LoadingSpinner />)
    
    const flexContainer = container.querySelector('.flex.items-center.justify-center')
    expect(flexContainer).toBeInTheDocument()
  })

  it('renders with minimum height for consistent layout', () => {
    const { container } = render(<LoadingSpinner />)
    
    const minHeightElement = container.querySelector('.min-h-\\[200px\\]')
    expect(minHeightElement).toBeInTheDocument()
  })

  it('applies correct size classes for each size variant', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />)
    let spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-4', 'h-4')
    
    rerender(<LoadingSpinner size="md" />)
    spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-8', 'h-8')
    
    rerender(<LoadingSpinner size="lg" />)
    spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('w-12', 'h-12')
  })

  it('has loading-spinner class for CSS styling', () => {
    render(<LoadingSpinner />)
    
    const spinner = screen.getByTestId('loading-spinner')
    expect(spinner).toHaveClass('loading-spinner')
  })

  it('maintains consistent structure across different sizes', () => {
    const { container: smContainer } = render(<LoadingSpinner size="sm" />)
    const { container: lgContainer } = render(<LoadingSpinner size="lg" />)
    
    // Both should have the same container structure
    expect(smContainer.querySelector('.flex.items-center.justify-center')).toBeInTheDocument()
    expect(lgContainer.querySelector('.flex.items-center.justify-center')).toBeInTheDocument()
    
    expect(smContainer.querySelector('.min-h-\\[200px\\]')).toBeInTheDocument()
    expect(lgContainer.querySelector('.min-h-\\[200px\\]')).toBeInTheDocument()
  })
})
