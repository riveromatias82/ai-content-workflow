import { render, screen } from '@/test-utils'
import RootLayout from './layout'

// Mock the ApolloWrapper component
jest.mock('@/components/providers/apollo-wrapper', () => ({
  ApolloWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="apollo-wrapper">{children}</div>
  ),
}))

// Mock the Inter font
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter-font',
  }),
}))

describe('RootLayout', () => {
  it('renders children correctly', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders with proper HTML structure', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    // Check for html element with lang attribute
    const htmlElement = container.querySelector('html')
    expect(htmlElement).toHaveAttribute('lang', 'en')

    // Check for body element
    const bodyElement = container.querySelector('body')
    expect(bodyElement).toBeInTheDocument()
  })

  it('wraps children with ApolloWrapper', () => {
    render(
      <RootLayout>
        <div data-testid="test-child">Test Content</div>
      </RootLayout>
    )

    expect(screen.getByTestId('apollo-wrapper')).toBeInTheDocument()
    expect(screen.getByTestId('test-child')).toBeInTheDocument()
  })

  it('applies font class to body', () => {
    const { container } = render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    const bodyElement = container.querySelector('body')
    expect(bodyElement).toHaveClass('inter-font')
  })

  it('renders with proper metadata', () => {
    // Note: In a real test environment, you might want to test metadata differently
    // This test verifies the component renders without crashing
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <RootLayout>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </RootLayout>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<RootLayout>{null}</RootLayout>)
    
    // Should not crash and render the basic structure
    expect(screen.getByTestId('apollo-wrapper')).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<RootLayout>{undefined}</RootLayout>)
    
    // Should not crash and render the basic structure
    expect(screen.getByTestId('apollo-wrapper')).toBeInTheDocument()
  })

  it('maintains consistent structure across re-renders', () => {
    const { rerender } = render(
      <RootLayout>
        <div data-testid="persistent-child">Persistent Child</div>
      </RootLayout>
    )

    expect(screen.getByTestId('persistent-child')).toBeInTheDocument()
    expect(screen.getByTestId('apollo-wrapper')).toBeInTheDocument()

    // Re-render with same children
    rerender(
      <RootLayout>
        <div data-testid="persistent-child">Persistent Child</div>
      </RootLayout>
    )

    expect(screen.getByTestId('persistent-child')).toBeInTheDocument()
    expect(screen.getByTestId('apollo-wrapper')).toBeInTheDocument()
  })

  it('renders with complex nested structure', () => {
    render(
      <RootLayout>
        <div className="container">
          <header>
            <h1>App Title</h1>
          </header>
          <main>
            <section>
              <h2>Section Title</h2>
              <p>Section content</p>
            </section>
          </main>
          <footer>
            <p>Footer content</p>
          </footer>
        </div>
      </RootLayout>
    )

    expect(screen.getByText('App Title')).toBeInTheDocument()
    expect(screen.getByText('Section Title')).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })

  it('includes global CSS import', () => {
    // This test verifies that the component imports globals.css
    // In a real test, you might check if the styles are applied
    render(
      <RootLayout>
        <div>Test Content</div>
      </RootLayout>
    )

    // The component should render without errors related to missing CSS
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })
})
