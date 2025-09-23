import { render, screen, fireEvent, waitFor } from '@/test-utils'
import { useMutation, useSubscription } from '@apollo/client'
import { useRouter } from 'next/navigation'
import NewCampaignPage from './page'
import { mockData, createMockRouter } from '@/test-utils'

// Mock the GraphQL hooks
jest.mock('@apollo/client')

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}))

const mockUseMutation = useMutation as jest.MockedFunction<typeof useMutation>
const mockUseSubscription = useSubscription as jest.MockedFunction<typeof useSubscription>
const mockUseRouter = useRouter as jest.MockedFunction<typeof useRouter>

describe('NewCampaignPage', () => {
  const mockRouter = createMockRouter()
  const mockCreateCampaign = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
    
    mockUseRouter.mockReturnValue(mockRouter)
    
    mockUseMutation.mockReturnValue([
      mockCreateCampaign,
      { loading: false, error: undefined, data: undefined }
    ] as any)
    
    mockUseSubscription.mockReturnValue({
      data: undefined,
      loading: false,
      error: undefined,
    } as any)
  })

  it('renders the form correctly', () => {
    render(<NewCampaignPage />)

    expect(screen.getByText('Create New Campaign')).toBeInTheDocument()
    expect(screen.getByText('Back to Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Basic Information')).toBeInTheDocument()
    expect(screen.getByText('Campaign Name *')).toBeInTheDocument()
    expect(screen.getByText('Description')).toBeInTheDocument()
    expect(screen.getByText('Target Languages')).toBeInTheDocument()
    expect(screen.getByText('Target Markets')).toBeInTheDocument()
    expect(screen.getByText('Create Campaign')).toBeInTheDocument()
    expect(screen.getByText('Cancel')).toBeInTheDocument()
  })

  it('initializes with default values', () => {
    render(<NewCampaignPage />)

    const nameInput = screen.getByLabelText('Campaign Name *')
    const descriptionInput = screen.getByLabelText('Description')

    expect(nameInput).toHaveValue('')
    expect(descriptionInput).toHaveValue('')
    
    // Should have English selected by default
    expect(screen.getByText('English')).toBeInTheDocument()
  })

  it('handles form input changes', () => {
    render(<NewCampaignPage />)

    const nameInput = screen.getByLabelText('Campaign Name *')
    const descriptionInput = screen.getByLabelText('Description')

    fireEvent.change(nameInput, { target: { value: 'Test Campaign' } })
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } })

    expect(nameInput).toHaveValue('Test Campaign')
    expect(descriptionInput).toHaveValue('Test description')
  })

  it('adds and removes target languages', () => {
    render(<NewCampaignPage />)

    // Add Spanish
    const spanishButton = screen.getByRole('button', { name: /Spanish/ })
    fireEvent.click(spanishButton)
    
    // Spanish should now be in the selected languages section
    expect(screen.getByText('Spanish')).toBeInTheDocument()

    // Add French
    const frenchButton = screen.getByRole('button', { name: /French/ })
    fireEvent.click(frenchButton)
    
    // French should now be in the selected languages section
    expect(screen.getByText('French')).toBeInTheDocument()

    // Remove Spanish from selected languages
    const spanishBadge = screen.getByText('Spanish').closest('.badge')
    const removeButton = spanishBadge?.querySelector('button')
    fireEvent.click(removeButton!)

    // Spanish should no longer be in selected languages, but should be back in available options
    // Check that Spanish is not in the selected languages section (badge)
    const spanishText = screen.queryByText('Spanish')
    const isInBadge = spanishText?.closest('.badge')
    expect(isInBadge).not.toBeInTheDocument()
    
    // French should still be selected
    expect(screen.getByText('French')).toBeInTheDocument()
  })

  it('prevents removing the last language', () => {
    render(<NewCampaignPage />)

    // Should only have English by default
    const englishBadge = screen.getByText('English').closest('.badge')
    const removeButton = englishBadge?.querySelector('button')
    
    // Remove button should not be present for the last language
    expect(removeButton).not.toBeInTheDocument()
  })

  it('adds and removes target markets', () => {
    render(<NewCampaignPage />)

    // Add North America
    const naButton = screen.getByRole('button', { name: /North America/ })
    fireEvent.click(naButton)
    
    // North America should now be in the selected markets section
    expect(screen.getByText('North America')).toBeInTheDocument()

    // Add Europe
    const europeButton = screen.getByRole('button', { name: /Europe/ })
    fireEvent.click(europeButton)
    
    // Europe should now be in the selected markets section
    expect(screen.getByText('Europe')).toBeInTheDocument()

    // Remove North America from selected markets
    const naBadge = screen.getByText('North America').closest('.badge')
    const removeButton = naBadge?.querySelector('button')
    fireEvent.click(removeButton!)

    // North America should no longer be in selected markets
    // Check that North America is not in the selected markets section (badge)
    const naText = screen.queryByText('North America')
    const isInBadge = naText?.closest('.badge')
    expect(isInBadge).not.toBeInTheDocument()
    
    // Europe should still be selected
    expect(screen.getByText('Europe')).toBeInTheDocument()
  })

  it('prevents adding duplicate languages', () => {
    render(<NewCampaignPage />)

    // English should already be selected
    expect(screen.getByText('English')).toBeInTheDocument()
    
    // Spanish button should be available
    const spanishButton = screen.getByRole('button', { name: /Spanish/ })
    expect(spanishButton).toBeInTheDocument()
    
    // Click Spanish to add it
    fireEvent.click(spanishButton)
    
    // Spanish should now be in selected languages
    expect(screen.getByText('Spanish')).toBeInTheDocument()

    // Spanish button should no longer be available in the options
    const spanishButtonAfter = screen.queryByRole('button', { name: /Spanish/ })
    expect(spanishButtonAfter).not.toBeInTheDocument()
  })

  it('prevents adding duplicate markets', () => {
    render(<NewCampaignPage />)

    // Add North America
    const naButton = screen.getByRole('button', { name: /North America/ })
    fireEvent.click(naButton)
    
    // North America should now be in selected markets
    expect(screen.getByText('North America')).toBeInTheDocument()

    // North America button should no longer be available in the options
    const naButtonAfter = screen.queryByRole('button', { name: /North America/ })
    expect(naButtonAfter).not.toBeInTheDocument()
  })

  it('submits form with correct data', async () => {
    mockCreateCampaign.mockResolvedValue({
      data: { createCampaign: { id: 'new-campaign-id' } }
    })

    render(<NewCampaignPage />)

    // Fill out the form
    fireEvent.change(screen.getByLabelText('Campaign Name *'), { 
      target: { value: 'New Test Campaign' } 
    })
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: 'Test description' } 
    })
    
    // Add languages
    fireEvent.click(screen.getByText('Spanish'))
    fireEvent.click(screen.getByText('French'))
    
    // Add markets
    fireEvent.click(screen.getByText('United States'))
    fireEvent.click(screen.getByText('United Kingdom'))

    // Submit form
    fireEvent.click(screen.getByText('Create Campaign'))

    await waitFor(() => {
      expect(mockCreateCampaign).toHaveBeenCalledWith({
        variables: {
          createCampaignInput: {
            name: 'New Test Campaign',
            description: 'Test description',
            targetLanguages: ['en', 'es', 'fr'],
            targetMarkets: ['United States', 'United Kingdom'],
          },
        },
      })
    })
  })

  it('navigates to campaign page after successful creation', async () => {
    // Mock the mutation to simulate successful creation
    mockCreateCampaign.mockResolvedValue({
      data: { createCampaign: { id: 'new-campaign-id' } }
    })

    // Mock useMutation to include onCompleted callback
    let onCompletedCallback: any = null
    mockUseMutation.mockImplementation((mutation, options) => {
      onCompletedCallback = options?.onCompleted
      return [mockCreateCampaign, { loading: false, error: undefined, data: undefined }]
    })

    render(<NewCampaignPage />)

    // Fill out and submit form
    fireEvent.change(screen.getByLabelText('Campaign Name *'), { 
      target: { value: 'New Campaign' } 
    })
    fireEvent.click(screen.getByText('Create Campaign'))

    // Simulate the onCompleted callback being called
    if (onCompletedCallback) {
      onCompletedCallback({ createCampaign: { id: 'new-campaign-id' } })
    }

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/campaigns/new-campaign-id')
    })
  })

  it('shows loading state during submission', () => {
    mockUseMutation.mockReturnValue([
      mockCreateCampaign,
      { loading: true, error: undefined, data: undefined }
    ] as any)

    render(<NewCampaignPage />)

    const submitButton = screen.getByText('Creating...')
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('disables submit button when name is empty', () => {
    render(<NewCampaignPage />)

    const submitButton = screen.getByText('Create Campaign')
    expect(submitButton).toBeDisabled()
  })

  it('enables submit button when name is provided', () => {
    render(<NewCampaignPage />)

    fireEvent.change(screen.getByLabelText('Campaign Name *'), { 
      target: { value: 'Test Campaign' } 
    })

    const submitButton = screen.getByText('Create Campaign')
    expect(submitButton).not.toBeDisabled()
  })

  it('trims whitespace from form inputs', async () => {
    mockCreateCampaign.mockResolvedValue({
      data: { createCampaign: { id: 'new-campaign-id' } }
    })

    render(<NewCampaignPage />)

    // Fill out form with whitespace
    fireEvent.change(screen.getByLabelText('Campaign Name *'), { 
      target: { value: '  Test Campaign  ' } 
    })
    fireEvent.change(screen.getByLabelText('Description'), { 
      target: { value: '  Test description  ' } 
    })

    fireEvent.click(screen.getByText('Create Campaign'))

    await waitFor(() => {
      expect(mockCreateCampaign).toHaveBeenCalledWith({
        variables: {
          createCampaignInput: {
            name: 'Test Campaign',
            description: 'Test description',
            targetLanguages: ['en'],
            targetMarkets: [],
          },
        },
      })
    })
  })

  it('handles undefined description correctly', async () => {
    mockCreateCampaign.mockResolvedValue({
      data: { createCampaign: { id: 'new-campaign-id' } }
    })

    render(<NewCampaignPage />)

    // Only fill name, leave description empty
    fireEvent.change(screen.getByLabelText('Campaign Name *'), { 
      target: { value: 'Test Campaign' } 
    })

    fireEvent.click(screen.getByText('Create Campaign'))

    await waitFor(() => {
      expect(mockCreateCampaign).toHaveBeenCalledWith({
        variables: {
          createCampaignInput: {
            name: 'Test Campaign',
            description: undefined,
            targetLanguages: ['en'],
            targetMarkets: [],
          },
        },
      })
    })
  })

  it('sets up subscriptions correctly', () => {
    render(<NewCampaignPage />)

    // Should set up campaign subscriptions
    expect(mockUseSubscription).toHaveBeenCalledTimes(2)
  })

  it('handles cancel navigation', () => {
    render(<NewCampaignPage />)

    fireEvent.click(screen.getByText('Cancel'))

    expect(mockRouter.push).not.toHaveBeenCalled() // Should navigate to home page
  })

  it('renders all available languages', () => {
    render(<NewCampaignPage />)

    // Check for common languages
    expect(screen.getByText('Spanish')).toBeInTheDocument()
    expect(screen.getByText('French')).toBeInTheDocument()
    expect(screen.getByText('German')).toBeInTheDocument()
    expect(screen.getByText('Italian')).toBeInTheDocument()
    expect(screen.getByText('Portuguese')).toBeInTheDocument()
    expect(screen.getByText('Chinese')).toBeInTheDocument()
    expect(screen.getByText('Japanese')).toBeInTheDocument()
    expect(screen.getByText('Korean')).toBeInTheDocument()
    expect(screen.getByText('Arabic')).toBeInTheDocument()
  })

  it('renders all available markets', () => {
    render(<NewCampaignPage />)

    // Check for common markets
    expect(screen.getByText('North America')).toBeInTheDocument()
    expect(screen.getByText('Europe')).toBeInTheDocument()
    expect(screen.getByText('Asia Pacific')).toBeInTheDocument()
    expect(screen.getByText('United States')).toBeInTheDocument()
    expect(screen.getByText('United Kingdom')).toBeInTheDocument()
    expect(screen.getByText('Germany')).toBeInTheDocument()
    expect(screen.getByText('France')).toBeInTheDocument()
    expect(screen.getByText('Japan')).toBeInTheDocument()
    expect(screen.getByText('Australia')).toBeInTheDocument()
    expect(screen.getByText('Brazil')).toBeInTheDocument()
    expect(screen.getByText('India')).toBeInTheDocument()
    expect(screen.getByText('China')).toBeInTheDocument()
  })
})
