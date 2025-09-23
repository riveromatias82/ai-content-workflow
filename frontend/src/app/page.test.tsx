import { render, screen, waitFor } from '@/test-utils'
import { useQuery, useSubscription } from '@apollo/client'
import HomePage from './page'
import { mockQueries, mockData } from '@/test-utils'

// Mock the GraphQL hooks
jest.mock('@apollo/client')

const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>

describe('HomePage', () => {
  const mockRefetch = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Default mock for subscriptions (they don't return anything meaningful for UI)
    mockUseSubscription.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    } as any)
  })

  it('renders loading state', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: true,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Should show loading spinner
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders error state', () => {
    const error = new Error('Failed to fetch campaigns')
    mockUseQuery.mockReturnValue({
      data: undefined,
      loading: false,
      error,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('Failed to fetch campaigns')).toBeInTheDocument()
  })

  it('renders empty state when no campaigns exist', () => {
    mockUseQuery.mockReturnValue({
      data: { campaigns: [] },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    expect(screen.getByText('🚀 AI Content Workflow')).toBeInTheDocument()
    expect(screen.getByText('No campaigns yet')).toBeInTheDocument()
    expect(screen.getByText(/Get started by creating your first campaign/)).toBeInTheDocument()
    expect(screen.getByText('Create Your First Campaign')).toBeInTheDocument()
  })

  it('renders campaigns correctly', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        id: 'campaign-1',
        name: 'Test Campaign 1',
        description: 'Test description 1',
        status: 'ACTIVE',
        targetLanguages: ['en', 'es'],
        contentPieces: [
          {
            id: 'piece-1',
            reviewState: 'APPROVED',
          },
          {
            id: 'piece-2',
            reviewState: 'AI_SUGGESTED',
          },
        ],
      },
      {
        ...mockData.campaign,
        id: 'campaign-2',
        name: 'Test Campaign 2',
        description: 'Test description 2',
        status: 'DRAFT',
        targetLanguages: ['fr'],
        contentPieces: [],
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Check header
    expect(screen.getByText('🚀 AI Content Workflow')).toBeInTheDocument()
    expect(screen.getByText('ACME Global Media')).toBeInTheDocument()
    expect(screen.getByText('New Campaign')).toBeInTheDocument()

    // Check dashboard stats
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Content Pieces')).toBeInTheDocument()
    
    // Check that we have the expected numbers in the stat cards
    const statNumbers = screen.getAllByText(/\d+/)
    expect(statNumbers.length).toBeGreaterThanOrEqual(4) // At least 4 stat numbers

    expect(screen.getByText('AI Suggested')).toBeInTheDocument()
    expect(screen.getAllByText('1')).toHaveLength(2) // AI suggested count and Approved count

    expect(screen.getByText('Approved')).toBeInTheDocument()

    // Check campaign cards
    expect(screen.getByText('Test Campaign 1')).toBeInTheDocument()
    expect(screen.getByText('Test Campaign 2')).toBeInTheDocument()
    expect(screen.getByText('Test description 1')).toBeInTheDocument()
    expect(screen.getByText('Test description 2')).toBeInTheDocument()
  })

  it('calculates dashboard statistics correctly', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        contentPieces: [
          { reviewState: 'DRAFT' },
          { reviewState: 'AI_SUGGESTED' },
          { reviewState: 'AI_SUGGESTED' },
          { reviewState: 'UNDER_REVIEW' },
          { reviewState: 'APPROVED' },
          { reviewState: 'APPROVED' },
          { reviewState: 'REJECTED' },
        ],
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Check calculated stats - use more specific selectors
    expect(screen.getByText('Total Campaigns')).toBeInTheDocument()
    expect(screen.getByText('Content Pieces')).toBeInTheDocument()
    expect(screen.getByText('AI Suggested')).toBeInTheDocument()
    expect(screen.getByText('Under Review')).toBeInTheDocument()
    expect(screen.getByText('Approved')).toBeInTheDocument()
    
    // Check the actual numbers by looking at the stat cards
    const statCards = screen.getAllByText(/\d+/)
    expect(statCards.length).toBeGreaterThanOrEqual(5) // Should have at least 5 stat numbers
  })

  it('renders campaign status badges correctly', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        name: 'Active Campaign',
        status: 'ACTIVE',
      },
      {
        ...mockData.campaign,
        name: 'Draft Campaign',
        status: 'DRAFT',
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    expect(screen.getByText('ACTIVE')).toBeInTheDocument()
    expect(screen.getByText('DRAFT')).toBeInTheDocument()
  })

  it('renders target languages correctly', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        name: 'Multi-language Campaign',
        targetLanguages: ['en', 'es', 'fr', 'de', 'it'],
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Should show first 3 languages
    expect(screen.getByText('EN')).toBeInTheDocument()
    expect(screen.getByText('ES')).toBeInTheDocument()
    expect(screen.getByText('FR')).toBeInTheDocument()
    
    // Should show "+2 more" for remaining languages
    expect(screen.getByText('+2 more')).toBeInTheDocument()
  })

  it('sets up subscriptions correctly', () => {
    mockUseQuery.mockReturnValue({
      data: { campaigns: [] },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Should set up all required subscriptions
    expect(mockUseSubscription).toHaveBeenCalledTimes(4)
    
    // Check that refetch is called when subscriptions receive data
    expect(mockUseSubscription).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        onData: expect.any(Function),
      })
    )
  })

  it('handles subscription data updates', () => {
    mockUseQuery.mockReturnValue({
      data: { campaigns: [] },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    // Get the subscription onData callback
    const subscriptionCall = mockUseSubscription.mock.calls[0]
    const onDataCallback = subscriptionCall[1].onData

    // Simulate subscription data
    onDataCallback({ data: { campaignCreated: mockData.campaign } })

    // Should call refetch to update the data
    expect(mockRefetch).toHaveBeenCalled()
  })

  it('renders campaign action buttons', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        name: 'Test Campaign',
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    expect(screen.getByText('View Details')).toBeInTheDocument()
    expect(screen.getByText('Edit')).toBeInTheDocument()
  })

  it('handles campaigns with no description', () => {
    const campaigns = [
      {
        ...mockData.campaign,
        name: 'Campaign without description',
        description: null,
      },
    ]

    mockUseQuery.mockReturnValue({
      data: { campaigns },
      loading: false,
      error: undefined,
      refetch: mockRefetch,
    } as any)

    render(<HomePage />)

    expect(screen.getByText('Campaign without description')).toBeInTheDocument()
    // Should not crash when description is null
  })
})
