import { render, RenderOptions } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { ReactElement } from 'react'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  mocks?: MockedResponse[]
  addTypename?: boolean
}

export function renderWithProviders(
  ui: ReactElement,
  { mocks = [], addTypename = false, ...renderOptions }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <MockedProvider mocks={mocks} addTypename={addTypename}>
        {children}
      </MockedProvider>
    )
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Re-export everything from React Testing Library
export * from '@testing-library/react'
export { renderWithProviders as render }

// Mock data factories for consistent test data
export const mockData = {
  campaign: {
    id: 'campaign-1',
    name: 'Test Campaign',
    description: 'Test campaign description',
    status: 'ACTIVE',
    targetLanguages: ['en', 'es'],
    targetMarkets: ['US', 'UK'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    contentPieces: [],
  },
  
  contentPiece: {
    id: 'content-1',
    title: 'Test Content',
    type: 'HEADLINE',
    reviewState: 'DRAFT',
    briefing: 'Test briefing',
    targetAudience: 'General audience',
    tone: 'Professional',
    keywords: ['test', 'content'],
    sourceLanguage: 'en',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    versions: [],
  },
  
  contentVersion: {
    id: 'version-1',
    content: 'Test content text',
    language: 'en',
    type: 'HEADLINE',
    aiProvider: 'openai',
    aiModel: 'gpt-4',
    sentimentAnalysis: { sentiment: 'positive', confidence: 0.95 },
    version: 1,
    isActive: true,
    reviewNotes: 'Test review notes',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
}

// Mock GraphQL queries and mutations
export const mockQueries = {
  GET_CAMPAIGNS: {
    request: {
      query: require('@/graphql/queries').GET_CAMPAIGNS,
    },
    result: {
      data: {
        campaigns: [mockData.campaign],
      },
    },
  },
  
  GET_CAMPAIGN: {
    request: {
      query: require('@/graphql/queries').GET_CAMPAIGN,
      variables: { id: 'campaign-1' },
    },
    result: {
      data: {
        campaign: mockData.campaign,
      },
    },
  },
}

// Helper to create mock GraphQL responses
export const createMockResponse = (data: any, errors: any[] = []) => ({
  data,
  errors,
  loading: false,
  networkStatus: 7,
})

// Helper to create mock loading state
export const createMockLoading = () => ({
  data: undefined,
  errors: undefined,
  loading: true,
  networkStatus: 1,
})

// Helper to create mock error state
export const createMockError = (error: Error) => ({
  data: undefined,
  errors: [{ message: error.message }],
  loading: false,
  networkStatus: 8,
})

// Helper to create mock refetch function
export const createMockRefetch = () => jest.fn().mockResolvedValue({})

// Helper to create mock router
export const createMockRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  prefetch: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
})

// Helper to create mock form data
export const createMockFormData = (overrides: any = {}) => ({
  name: 'Test Campaign',
  description: 'Test description',
  targetLanguages: ['en'],
  targetMarkets: [],
  ...overrides,
})
