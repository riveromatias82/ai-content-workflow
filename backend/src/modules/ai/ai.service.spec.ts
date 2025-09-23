import { Test, TestingModule } from '@nestjs/testing';
import { AiService, GenerateContentRequest, TranslateContentRequest } from './ai.service';
import { ContentType } from '../../entities/content-piece.entity';
import { AiProvider } from '../../entities/content-version.entity';
import { ChatOpenAI } from '@langchain/openai';

// Type for service with exposed private properties for testing
interface AiServiceWithPrivate {
  openai?: { chat: { completions: { create: jest.Mock } } };
  anthropic?: { messages: { create: jest.Mock } };
  openaiChat?: { predict: jest.Mock };
  anthropicChat?: { predict: jest.Mock };
  generateContent(
    request: GenerateContentRequest,
  ): Promise<{ content: string; metadata: Record<string, unknown> }>;
  translateContent(
    request: TranslateContentRequest,
  ): Promise<{ content: string; metadata: Record<string, unknown> }>;
  analyzeContent(content: string): Promise<{
    sentiment: string;
    confidence: number;
    keywords: string[];
    tone: string;
    readabilityScore: number;
  }>;
}

// Mock the external dependencies
jest.mock('openai', () => ({
  OpenAI: jest.fn().mockImplementation(() => ({
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  })),
}));

jest.mock('@anthropic-ai/sdk', () => ({
  default: jest.fn().mockImplementation(() => ({
    messages: {
      create: jest.fn(),
    },
  })),
}));

jest.mock('@langchain/openai', () => ({
  ChatOpenAI: jest.fn().mockImplementation(() => ({
    predict: jest.fn(),
  })),
}));

jest.mock('@langchain/anthropic', () => ({
  ChatAnthropic: jest.fn().mockImplementation(() => ({
    predict: jest.fn(),
  })),
}));

describe('AiService', () => {
  let service: AiServiceWithPrivate;
  let mockOpenAI: jest.Mocked<{ chat: { completions: { create: jest.Mock } } }>;
  let mockAnthropic: jest.Mocked<{ messages: { create: jest.Mock } }>;
  let mockOpenAIChat: jest.Mocked<{ predict: jest.Mock }>;
  // let mockAnthropicChat: jest.Mocked<{ predict: jest.Mock }>; // Unused variable

  beforeEach(async () => {
    // Set up environment variables for testing
    process.env.OPENAI_API_KEY = 'test-openai-key';
    process.env.ANTHROPIC_API_KEY = 'test-anthropic-key';

    const module: TestingModule = await Test.createTestingModule({
      providers: [AiService],
    }).compile();

    service = module.get<AiService>(AiService) as unknown as AiServiceWithPrivate;

    // Get mocked instances
    const { OpenAI } = await import('openai');
    const Anthropic = (await import('@anthropic-ai/sdk')).default;
    const { ChatOpenAI } = await import('@langchain/openai');

    mockOpenAI = new OpenAI() as unknown as jest.Mocked<{
      chat: { completions: { create: jest.Mock } };
    }>;
    mockAnthropic = new Anthropic() as unknown as jest.Mocked<{ messages: { create: jest.Mock } }>;
    mockOpenAIChat = new ChatOpenAI() as unknown as jest.Mocked<{ predict: jest.Mock }>;
    // mockAnthropicChat = new ChatAnthropic() as unknown as jest.Mocked<{ predict: jest.Mock }>; // Unused variable
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.OPENAI_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
  });

  describe('generateContent', () => {
    const mockRequest: GenerateContentRequest = {
      type: ContentType.HEADLINE,
      briefing: 'Create a catchy headline for a new product',
      targetAudience: 'Young adults',
      tone: 'Energetic',
      keywords: ['innovation', 'technology'],
      language: 'en',
      provider: AiProvider.OPENAI,
    };

    it('should generate content successfully with OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Revolutionary Innovation: The Future of Technology is Here!',
            },
          },
        ],
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.generateContent(mockRequest);

      expect(result).toEqual({
        content: 'Revolutionary Innovation: The Future of Technology is Here!',
        metadata: {
          model: 'gpt-4',
          provider: 'openai',
          usage: mockResponse.usage,
          prompt_tokens: 100,
          completion_tokens: 50,
        },
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [{ role: 'user', content: expect.stringContaining('Create a catchy headline') }],
        temperature: 0.7,
        max_tokens: 500,
      });
    });

    it('should generate content successfully with Anthropic', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: 'Amazing Innovation: Technology That Changes Everything!',
          },
        ],
        usage: {
          input_tokens: 100,
          output_tokens: 50,
        },
      };

      // Mock the Anthropic instance in the service
      service.anthropic = mockAnthropic;
      mockAnthropic.messages.create.mockResolvedValue(mockResponse);

      const result = await service.generateContent({
        ...mockRequest,
        provider: AiProvider.ANTHROPIC,
      });

      expect(result).toEqual({
        content: 'Amazing Innovation: Technology That Changes Everything!',
        metadata: {
          model: 'claude-3-sonnet-20240229',
          provider: 'anthropic',
          usage: mockResponse.usage,
        },
      });

      expect(mockAnthropic.messages.create).toHaveBeenCalledWith({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 500,
        messages: [{ role: 'user', content: expect.stringContaining('Create a catchy headline') }],
      });
    });

    it('should generate content successfully with LangChain', async () => {
      // Mock the LangChain instance in the service
      service.openaiChat = mockOpenAIChat;
      // Make the mock appear as an instance of ChatOpenAI
      Object.setPrototypeOf(mockOpenAIChat, ChatOpenAI.prototype);
      mockOpenAIChat.predict.mockResolvedValue(
        'LangChain Generated Content: Innovation at its Best!',
      );

      const result = await service.generateContent({
        ...mockRequest,
        provider: AiProvider.LANGCHAIN,
      });

      expect(result).toEqual({
        content: 'LangChain Generated Content: Innovation at its Best!',
        metadata: {
          provider: 'langchain',
          model: 'openai',
        },
      });

      expect(mockOpenAIChat.predict).toHaveBeenCalledWith(
        expect.stringContaining('Create a catchy headline'),
      );
    });

    it('should throw error when provider is not configured', async () => {
      // Create a new service instance without API keys
      const serviceWithoutKeys = new AiService() as unknown as AiServiceWithPrivate;
      serviceWithoutKeys.openai = undefined;
      serviceWithoutKeys.anthropic = undefined;

      await expect(
        serviceWithoutKeys.generateContent({
          ...mockRequest,
          provider: AiProvider.OPENAI,
        }),
      ).rejects.toThrow('AI provider OPENAI not configured');
    });

    it('should handle OpenAI API errors', async () => {
      const error = new Error('OpenAI API error');
      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockRejectedValue(error);

      await expect(service.generateContent(mockRequest)).rejects.toThrow('OpenAI API error');
    });

    it('should build correct prompt for different content types', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test content' } }],
        usage: { prompt_tokens: 50, completion_tokens: 25 },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await service.generateContent({
        ...mockRequest,
        type: ContentType.SOCIAL_POST,
      });

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      expect(callArgs.messages[0].content).toContain('social media post');
    });
  });

  describe('translateContent', () => {
    const mockRequest: TranslateContentRequest = {
      content: 'Hello, world!',
      sourceLanguage: 'en',
      targetLanguage: 'es',
      context: 'Greeting message',
      provider: AiProvider.OPENAI,
    };

    it('should translate content successfully with OpenAI', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: '¡Hola, mundo!',
            },
          },
        ],
        usage: {
          prompt_tokens: 50,
          completion_tokens: 30,
        },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.translateContent(mockRequest);

      expect(result).toEqual({
        content: '¡Hola, mundo!',
        metadata: {
          model: 'gpt-4',
          provider: 'openai',
          usage: mockResponse.usage,
        },
      });

      expect(mockOpenAI.chat.completions.create).toHaveBeenCalledWith({
        model: 'gpt-4',
        messages: [
          { role: 'user', content: expect.stringContaining('Translate the following content') },
        ],
        temperature: 0.3,
      });
    });

    it('should translate content successfully with Anthropic', async () => {
      const mockResponse = {
        content: [
          {
            type: 'text',
            text: '¡Hola, mundo!',
          },
        ],
        usage: {
          input_tokens: 50,
          output_tokens: 30,
        },
      };

      // Mock the Anthropic instance in the service
      service.anthropic = mockAnthropic;
      mockAnthropic.messages.create.mockResolvedValue(mockResponse);

      const result = await service.translateContent({
        ...mockRequest,
        provider: AiProvider.ANTHROPIC,
      });

      expect(result).toEqual({
        content: '¡Hola, mundo!',
        metadata: {
          model: 'claude-3-sonnet-20240229',
          provider: 'anthropic',
          usage: mockResponse.usage,
        },
      });
    });

    it('should throw error when provider is not configured', async () => {
      // Create a new service instance without API keys
      const serviceWithoutKeys = new AiService() as unknown as AiServiceWithPrivate;
      serviceWithoutKeys.openai = undefined;
      serviceWithoutKeys.anthropic = undefined;

      await expect(
        serviceWithoutKeys.translateContent({
          ...mockRequest,
          provider: AiProvider.OPENAI,
        }),
      ).rejects.toThrow('AI provider OPENAI not configured');
    });

    it('should handle translation errors', async () => {
      const error = new Error('Translation API error');
      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockRejectedValue(error);

      await expect(service.translateContent(mockRequest)).rejects.toThrow('Translation API error');
    });
  });

  describe('analyzeContent', () => {
    it('should analyze content successfully', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: JSON.stringify({
                sentiment: 'positive',
                confidence: 0.9,
                keywords: ['innovation', 'technology'],
                tone: 'professional',
                readabilityScore: 85,
              }),
            },
          },
        ],
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.analyzeContent('This is amazing innovative technology!');

      expect(result).toEqual({
        sentiment: 'positive',
        confidence: 0.9,
        keywords: ['innovation', 'technology'],
        tone: 'professional',
        readabilityScore: 85,
      });
    });

    it('should return default values when OpenAI is not configured', async () => {
      delete process.env.OPENAI_API_KEY;

      const result = await service.analyzeContent('Test content');

      expect(result).toEqual({
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        tone: 'unknown',
        readabilityScore: 50,
      });
    });

    it('should handle analysis errors gracefully', async () => {
      const error = new Error('Analysis API error');
      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockRejectedValue(error);

      const result = await service.analyzeContent('Test content');

      expect(result).toEqual({
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        tone: 'unknown',
        readabilityScore: 50,
      });
    });

    it('should handle invalid JSON response', async () => {
      const mockResponse = {
        choices: [
          {
            message: {
              content: 'Invalid JSON response',
            },
          },
        ],
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      const result = await service.analyzeContent('Test content');

      expect(result).toEqual({
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        tone: 'unknown',
        readabilityScore: 50,
      });
    });
  });

  describe('buildContentPrompt', () => {
    it('should build correct prompt for headline', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test headline' } }],
        usage: { prompt_tokens: 50, completion_tokens: 25 },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await service.generateContent({
        type: ContentType.HEADLINE,
        briefing: 'Test briefing',
        targetAudience: 'Test audience',
        tone: 'Test tone',
        keywords: ['keyword1', 'keyword2'],
        language: 'es',
      });

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain('attention-grabbing headline');
      expect(prompt).toContain('Test briefing');
      expect(prompt).toContain('Test audience');
      expect(prompt).toContain('Test tone');
      expect(prompt).toContain('keyword1, keyword2');
      expect(prompt).toContain('Language: es');
    });

    it('should build correct prompt for social post', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Test social post' } }],
        usage: { prompt_tokens: 50, completion_tokens: 25 },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await service.generateContent({
        type: ContentType.SOCIAL_POST,
        briefing: 'Test briefing',
      });

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain('social media post');
    });
  });

  describe('buildTranslationPrompt', () => {
    it('should build correct translation prompt', async () => {
      const mockResponse = {
        choices: [{ message: { content: 'Translated content' } }],
        usage: { prompt_tokens: 50, completion_tokens: 25 },
      };

      // Mock the OpenAI instance in the service
      service.openai = mockOpenAI;
      mockOpenAI.chat.completions.create.mockResolvedValue(mockResponse);

      await service.translateContent({
        content: 'Hello world',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        context: 'Greeting',
      });

      const callArgs = mockOpenAI.chat.completions.create.mock.calls[0][0];
      const prompt = callArgs.messages[0].content;

      expect(prompt).toContain('Translate the following content from en to es');
      expect(prompt).toContain('Hello world');
      expect(prompt).toContain('Context: Greeting');
    });
  });
});
