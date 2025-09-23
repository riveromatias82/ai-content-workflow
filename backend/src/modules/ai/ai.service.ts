import { Injectable, Logger } from '@nestjs/common';
import { OpenAI } from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { ContentType } from '../../entities/content-piece.entity';
import { AiProvider } from '../../entities/content-version.entity';

export interface GenerateContentRequest {
  type: ContentType;
  briefing: string;
  targetAudience?: string;
  tone?: string;
  keywords?: string[];
  language?: string;
  provider?: AiProvider;
}

export interface TranslateContentRequest {
  content: string;
  sourceLanguage: string;
  targetLanguage: string;
  context?: string;
  provider?: AiProvider;
}

export interface ContentAnalysisResult {
  sentiment: string;
  confidence: number;
  keywords: string[];
  tone: string;
  readabilityScore: number;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private openai: OpenAI;
  private anthropic: Anthropic;
  private openaiChat: ChatOpenAI;
  private anthropicChat: ChatAnthropic;

  constructor() {
    // Initialize AI providers
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      this.openaiChat = new ChatOpenAI({
        openAIApiKey: process.env.OPENAI_API_KEY,
        modelName: 'gpt-4',
        temperature: 0.7,
      });
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      this.anthropicChat = new ChatAnthropic({
        anthropicApiKey: process.env.ANTHROPIC_API_KEY,
        modelName: 'claude-3-sonnet-20240229',
        temperature: 0.7,
      });
    }
  }

  async generateContent(request: GenerateContentRequest): Promise<{
    content: string;
    metadata: Record<string, unknown>;
  }> {
    const provider = request.provider || AiProvider.OPENAI;

    try {
      const prompt = this.buildContentPrompt(request);

      if (provider === AiProvider.OPENAI && this.openai) {
        return await this.generateWithOpenAI(prompt, request);
      } else if (provider === AiProvider.ANTHROPIC && this.anthropic) {
        return await this.generateWithAnthropic(prompt, request);
      } else if (provider === AiProvider.LANGCHAIN) {
        return await this.generateWithLangChain(prompt, request);
      }

      throw new Error(`AI provider ${provider} not configured`);
    } catch (error) {
      this.logger.error(`Content generation failed: ${error.message}`);
      throw error;
    }
  }

  async translateContent(request: TranslateContentRequest): Promise<{
    content: string;
    metadata: Record<string, unknown>;
  }> {
    const provider = request.provider || AiProvider.OPENAI;

    try {
      const prompt = this.buildTranslationPrompt(request);

      if (provider === AiProvider.OPENAI && this.openai) {
        const response = await this.openai.chat.completions.create({
          model: 'gpt-4',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
        });

        return {
          content: response.choices[0].message.content?.trim() || '',
          metadata: {
            model: 'gpt-4',
            provider: 'openai',
            usage: response.usage,
          },
        };
      } else if (provider === AiProvider.ANTHROPIC && this.anthropic) {
        const response = await this.anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }],
        });

        const content = response.content[0];
        return {
          content: content.type === 'text' ? content.text : '',
          metadata: {
            model: 'claude-3-sonnet-20240229',
            provider: 'anthropic',
            usage: response.usage,
          },
        };
      }

      throw new Error(`AI provider ${provider} not configured`);
    } catch (error) {
      this.logger.error(`Translation failed: ${error.message}`);
      throw error;
    }
  }

  async analyzeContent(content: string): Promise<ContentAnalysisResult> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI not configured for content analysis');
      }

      const prompt = `
        Analyze the following content and provide a JSON response with sentiment analysis:
        
        Content: "${content}"
        
        Please respond with a JSON object containing:
        - sentiment: "positive", "negative", or "neutral"
        - confidence: number between 0 and 1
        - keywords: array of important keywords
        - tone: descriptive tone (e.g., "professional", "casual", "urgent")
        - readabilityScore: number between 0 and 100
      `;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      });

      const analysisText = response.choices[0].message.content?.trim() || '{}';
      return JSON.parse(analysisText);
    } catch (error) {
      this.logger.error(`Content analysis failed: ${error.message}`);
      return {
        sentiment: 'neutral',
        confidence: 0.5,
        keywords: [],
        tone: 'unknown',
        readabilityScore: 50,
      };
    }
  }

  private buildContentPrompt(request: GenerateContentRequest): string {
    const typeDescriptions = {
      [ContentType.HEADLINE]: 'attention-grabbing headline',
      [ContentType.DESCRIPTION]: 'detailed description',
      [ContentType.AD_COPY]: 'persuasive advertisement copy',
      [ContentType.PRODUCT_DESCRIPTION]: 'product description',
      [ContentType.SOCIAL_POST]: 'social media post',
      [ContentType.EMAIL_SUBJECT]: 'email subject line',
      [ContentType.BLOG_TITLE]: 'blog article title',
    };

    let prompt = `Create a ${typeDescriptions[request.type]} based on the following requirements:\n\n`;
    prompt += `Briefing: ${request.briefing}\n`;

    if (request.targetAudience) {
      prompt += `Target Audience: ${request.targetAudience}\n`;
    }

    if (request.tone) {
      prompt += `Tone: ${request.tone}\n`;
    }

    if (request.keywords && request.keywords.length > 0) {
      prompt += `Keywords to include: ${request.keywords.join(', ')}\n`;
    }

    if (request.language && request.language !== 'en') {
      prompt += `Language: ${request.language}\n`;
    }

    prompt += '\nPlease provide only the content without any additional explanation.';

    return prompt;
  }

  private buildTranslationPrompt(request: TranslateContentRequest): string {
    let prompt = `Translate the following content from ${request.sourceLanguage} to ${request.targetLanguage}:\n\n`;
    prompt += `Content: "${request.content}"\n\n`;

    if (request.context) {
      prompt += `Context: ${request.context}\n\n`;
    }

    prompt +=
      'Please provide a natural, culturally appropriate translation that maintains the original tone and intent. Provide only the translated content without additional explanation.';

    return prompt;
  }

  private async generateWithOpenAI(prompt: string, _request: GenerateContentRequest) {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 500,
    });

    return {
      content: response.choices[0].message.content?.trim() || '',
      metadata: {
        model: 'gpt-4',
        provider: 'openai',
        usage: response.usage,
        prompt_tokens: response.usage?.prompt_tokens,
        completion_tokens: response.usage?.completion_tokens,
      },
    };
  }

  private async generateWithAnthropic(prompt: string, _request: GenerateContentRequest) {
    const response = await this.anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 500,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    return {
      content: content.type === 'text' ? content.text : '',
      metadata: {
        model: 'claude-3-sonnet-20240229',
        provider: 'anthropic',
        usage: response.usage,
      },
    };
  }

  private async generateWithLangChain(prompt: string, _request: GenerateContentRequest) {
    const model = this.openaiChat || this.anthropicChat;
    if (!model) {
      throw new Error('No LangChain model available');
    }

    const result = await model.predict(prompt);

    return {
      content: result.trim(),
      metadata: {
        provider: 'langchain',
        model: model instanceof ChatOpenAI ? 'openai' : 'anthropic',
      },
    };
  }
}
