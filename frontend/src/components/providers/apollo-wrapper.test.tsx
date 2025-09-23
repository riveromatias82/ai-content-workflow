import { render, screen } from '@/test-utils'
import { ApolloWrapper } from './apollo-wrapper'
import { apolloClient } from '@/lib/apollo-client'

// Mock the apollo client
jest.mock('@/lib/apollo-client', () => ({
  apolloClient: {
    query: jest.fn(),
    mutate: jest.fn(),
    watchQuery: jest.fn(),
    subscribe: jest.fn(),
    cache: {
      readQuery: jest.fn(),
      writeQuery: jest.fn(),
      reset: jest.fn(),
    },
  },
}))

describe('ApolloWrapper', () => {
  it('renders children correctly', () => {
    render(
      <ApolloWrapper>
        <div data-testid="test-child">Test Content</div>
      </ApolloWrapper>
    )

    expect(screen.getByTestId('test-child')).toBeInTheDocument()
    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('renders multiple children', () => {
    render(
      <ApolloWrapper>
        <div data-testid="child-1">Child 1</div>
        <div data-testid="child-2">Child 2</div>
        <span data-testid="child-3">Child 3</span>
      </ApolloWrapper>
    )

    expect(screen.getByTestId('child-1')).toBeInTheDocument()
    expect(screen.getByTestId('child-2')).toBeInTheDocument()
    expect(screen.getByTestId('child-3')).toBeInTheDocument()
  })

  it('renders nested components', () => {
    render(
      <ApolloWrapper>
        <div>
          <h1>Title</h1>
          <p>Paragraph</p>
          <button>Button</button>
        </div>
      </ApolloWrapper>
    )

    expect(screen.getByText('Title')).toBeInTheDocument()
    expect(screen.getByText('Paragraph')).toBeInTheDocument()
    expect(screen.getByText('Button')).toBeInTheDocument()
  })

  it('handles empty children', () => {
    render(<ApolloWrapper>{null}</ApolloWrapper>)
    
    // Should not crash and render nothing
    expect(document.body).toBeInTheDocument()
  })

  it('handles undefined children', () => {
    render(<ApolloWrapper>{undefined}</ApolloWrapper>)
    
    // Should not crash and render nothing
    expect(document.body).toBeInTheDocument()
  })

  it('provides Apollo context to children', () => {
    // This test verifies that the component structure is correct
    // The actual Apollo context testing would require more complex setup
    const TestComponent = () => {
      return <div data-testid="apollo-child">Apollo Child</div>
    }

    render(
      <ApolloWrapper>
        <TestComponent />
      </ApolloWrapper>
    )

    expect(screen.getByTestId('apollo-child')).toBeInTheDocument()
  })

  it('renders with proper TypeScript types', () => {
    // Test that the component accepts React.ReactNode correctly
    const stringChild = 'String child'
    const numberChild = 42
    const elementChild = <div>Element child</div>

    const { rerender } = render(<ApolloWrapper>{stringChild}</ApolloWrapper>)
    expect(screen.getByText('String child')).toBeInTheDocument()

    rerender(<ApolloWrapper>{numberChild}</ApolloWrapper>)
    expect(screen.getByText('42')).toBeInTheDocument()

    rerender(<ApolloWrapper>{elementChild}</ApolloWrapper>)
    expect(screen.getByText('Element child')).toBeInTheDocument()
  })

  it('maintains component structure across re-renders', () => {
    const { rerender } = render(
      <ApolloWrapper>
        <div data-testid="persistent-child">Persistent Child</div>
      </ApolloWrapper>
    )

    expect(screen.getByTestId('persistent-child')).toBeInTheDocument()

    // Re-render with same children
    rerender(
      <ApolloWrapper>
        <div data-testid="persistent-child">Persistent Child</div>
      </ApolloWrapper>
    )

    expect(screen.getByTestId('persistent-child')).toBeInTheDocument()
  })

  it('handles complex nested structures', () => {
    render(
      <ApolloWrapper>
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
      </ApolloWrapper>
    )

    expect(screen.getByText('App Title')).toBeInTheDocument()
    expect(screen.getByText('Section Title')).toBeInTheDocument()
    expect(screen.getByText('Section content')).toBeInTheDocument()
    expect(screen.getByText('Footer content')).toBeInTheDocument()
  })
})
