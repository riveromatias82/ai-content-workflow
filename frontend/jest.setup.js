import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock Next.js Link component
jest.mock('next/link', () => {
  return function MockLink({ children, href, ...props }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }
})

// Mock Apollo Client hooks
jest.mock('@apollo/client', () => ({
  ...jest.requireActual('@apollo/client'),
  useQuery: jest.fn(),
  useMutation: jest.fn(),
  useSubscription: jest.fn(),
  ApolloProvider: ({ children }) => children,
}))

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  AlertCircle: () => <div data-testid="alert-circle-icon" />,
  Plus: () => <div data-testid="plus-icon" />,
  Briefcase: () => <div data-testid="briefcase-icon" />,
  TrendingUp: () => <div data-testid="trending-up-icon" />,
  Clock: () => <div data-testid="clock-icon" />,
  CheckCircle: () => <div data-testid="check-circle-icon" />,
  ArrowLeft: () => <div data-testid="arrow-left-icon" />,
  X: () => <div data-testid="x-icon" />,
}))

// Global test utilities
global.testUtils = {
  // Helper to create mock dates
  createMockDate: (dateString) => new Date(dateString),
  
  // Helper to wait for async operations
  waitFor: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
  
  // Helper to create mock GraphQL responses
  createMockGraphQLResponse: (data, errors = []) => ({
    data,
    errors,
    loading: false,
    networkStatus: 7,
  }),
  
  // Helper to create mock GraphQL loading state
  createMockGraphQLLoading: () => ({
    data: undefined,
    errors: undefined,
    loading: true,
    networkStatus: 1,
  }),
  
  // Helper to create mock GraphQL error state
  createMockGraphQLError: (error) => ({
    data: undefined,
    errors: [{ message: error.message }],
    loading: false,
    networkStatus: 8,
  }),
}

// Suppress console warnings in tests
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = jest.fn()
  console.warn = jest.fn()
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
})
