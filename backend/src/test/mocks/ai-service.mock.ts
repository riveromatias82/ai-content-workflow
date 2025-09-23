import { AiService, ContentAnalysisResult } from '../../modules/ai/ai.service';

export class MockAiService implements Partial<AiService> {
  generateContent = jest.fn();
  translateContent = jest.fn();
  analyzeContent = jest.fn();

  // Helper methods for test setup
  mockGenerateContentSuccess(
    content: string = 'Generated content',
    metadata: Record<string, unknown> = {},
  ) {
    this.generateContent.mockResolvedValue({
      content,
      metadata: {
        model: 'gpt-4',
        provider: 'openai',
        usage: { prompt_tokens: 100, completion_tokens: 50 },
        ...metadata,
      },
    });
  }

  mockGenerateContentError(error: Error = new Error('AI generation failed')) {
    this.generateContent.mockRejectedValue(error);
  }

  mockTranslateContentSuccess(
    translatedContent: string = 'Translated content',
    metadata: Record<string, unknown> = {},
  ) {
    this.translateContent.mockResolvedValue({
      content: translatedContent,
      metadata: {
        model: 'gpt-4',
        provider: 'openai',
        usage: { prompt_tokens: 50, completion_tokens: 30 },
        ...metadata,
      },
    });
  }

  mockTranslateContentError(error: Error = new Error('Translation failed')) {
    this.translateContent.mockRejectedValue(error);
  }

  mockAnalyzeContentSuccess(analysis: Partial<ContentAnalysisResult> = {}) {
    this.analyzeContent.mockResolvedValue({
      sentiment: 'positive',
      confidence: 0.8,
      keywords: ['test', 'content'],
      tone: 'professional',
      readabilityScore: 75,
      ...analysis,
    });
  }

  mockAnalyzeContentError(error: Error = new Error('Analysis failed')) {
    this.analyzeContent.mockRejectedValue(error);
  }

  // Reset all mocks
  reset() {
    this.generateContent.mockReset();
    this.translateContent.mockReset();
    this.analyzeContent.mockReset();
  }
}

export const createMockAiService = (): MockAiService => {
  return new MockAiService();
};
