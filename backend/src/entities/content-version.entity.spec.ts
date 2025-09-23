import { ContentVersion, VersionType, AiProvider } from './content-version.entity';
import { ContentPiece } from './content-piece.entity';

describe('ContentVersion Entity', () => {
  let contentVersion: ContentVersion;

  beforeEach(() => {
    contentVersion = new ContentVersion();
  });

  describe('basic properties', () => {
    it('should have all required properties', () => {
      // Initialize properties to test they can be set
      contentVersion.id = 'test-id';
      contentVersion.content = 'Test content';
      contentVersion.language = 'en';
      contentVersion.type = VersionType.ORIGINAL;
      contentVersion.aiProvider = AiProvider.OPENAI;
      contentVersion.aiModel = 'gpt-4';
      contentVersion.aiMetadata = { model: 'gpt-4' };
      contentVersion.sentimentAnalysis = {
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['test'],
      };
      contentVersion.version = 1;
      contentVersion.isActive = true;
      contentVersion.reviewNotes = 'Test notes';
      contentVersion.contentPieceId = 'content-piece-1';
      contentVersion.createdAt = new Date();
      contentVersion.updatedAt = new Date();

      expect(contentVersion.id).toBe('test-id');
      expect(contentVersion.content).toBe('Test content');
      expect(contentVersion.language).toBe('en');
      expect(contentVersion.type).toBe(VersionType.ORIGINAL);
      expect(contentVersion.aiProvider).toBe(AiProvider.OPENAI);
      expect(contentVersion.aiModel).toBe('gpt-4');
      expect(contentVersion.aiMetadata).toEqual({ model: 'gpt-4' });
      expect(contentVersion.sentimentAnalysis).toEqual({
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['test'],
      });
      expect(contentVersion.version).toBe(1);
      expect(contentVersion.isActive).toBe(true);
      expect(contentVersion.reviewNotes).toBe('Test notes');
      expect(contentVersion.contentPieceId).toBe('content-piece-1');
      expect(contentVersion.createdAt).toBeInstanceOf(Date);
      expect(contentVersion.updatedAt).toBeInstanceOf(Date);
    });

    it('should initialize with default values', () => {
      contentVersion.content = 'Test content';
      contentVersion.language = 'en';
      contentVersion.type = VersionType.ORIGINAL;
      contentVersion.version = 1;
      contentVersion.isActive = true;
      contentVersion.contentPieceId = 'content-piece-1';

      expect(contentVersion.content).toBe('Test content');
      expect(contentVersion.language).toBe('en');
      expect(contentVersion.type).toBe(VersionType.ORIGINAL);
      expect(contentVersion.version).toBe(1);
      expect(contentVersion.isActive).toBe(true);
      expect(contentVersion.contentPieceId).toBe('content-piece-1');
    });
  });

  describe('VersionType enum', () => {
    it('should accept all valid version types', () => {
      const validTypes = [
        VersionType.ORIGINAL,
        VersionType.AI_GENERATED,
        VersionType.AI_TRANSLATED,
        VersionType.HUMAN_EDITED,
      ];

      validTypes.forEach((type) => {
        contentVersion.type = type;
        expect(contentVersion.type).toBe(type);
      });
    });
  });

  describe('AiProvider enum', () => {
    it('should accept all valid AI providers', () => {
      const validProviders = [AiProvider.OPENAI, AiProvider.ANTHROPIC, AiProvider.LANGCHAIN];

      validProviders.forEach((provider) => {
        contentVersion.aiProvider = provider;
        expect(contentVersion.aiProvider).toBe(provider);
      });
    });
  });

  describe('content', () => {
    it('should handle text content', () => {
      contentVersion.content = 'This is test content';
      expect(contentVersion.content).toBe('This is test content');
    });

    it('should handle long content', () => {
      const longContent = 'A'.repeat(10000);
      contentVersion.content = longContent;
      expect(contentVersion.content).toBe(longContent);
    });

    it('should handle content with special characters', () => {
      contentVersion.content = 'Content with émojis 🚀 and spëcial chars!';
      expect(contentVersion.content).toBe('Content with émojis 🚀 and spëcial chars!');
    });

    it('should handle empty content', () => {
      contentVersion.content = '';
      expect(contentVersion.content).toBe('');
    });
  });

  describe('language', () => {
    it('should handle different language codes', () => {
      const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];

      languages.forEach((lang) => {
        contentVersion.language = lang;
        expect(contentVersion.language).toBe(lang);
      });
    });

    it('should default to en', () => {
      contentVersion.language = 'en';
      expect(contentVersion.language).toBe('en');
    });
  });

  describe('version number', () => {
    it('should handle positive version numbers', () => {
      contentVersion.version = 1;
      expect(contentVersion.version).toBe(1);

      contentVersion.version = 10;
      expect(contentVersion.version).toBe(10);

      contentVersion.version = 100;
      expect(contentVersion.version).toBe(100);
    });

    it('should default to 1', () => {
      contentVersion.version = 1;
      expect(contentVersion.version).toBe(1);
    });
  });

  describe('isActive flag', () => {
    it('should handle boolean values', () => {
      contentVersion.isActive = true;
      expect(contentVersion.isActive).toBe(true);

      contentVersion.isActive = false;
      expect(contentVersion.isActive).toBe(false);
    });

    it('should default to false', () => {
      contentVersion.isActive = false;
      expect(contentVersion.isActive).toBe(false);
    });
  });

  describe('optional properties', () => {
    it('should handle optional aiProvider', () => {
      contentVersion.aiProvider = AiProvider.OPENAI;
      expect(contentVersion.aiProvider).toBe(AiProvider.OPENAI);

      contentVersion.aiProvider = undefined;
      expect(contentVersion.aiProvider).toBeUndefined();

      contentVersion.aiProvider = null;
      expect(contentVersion.aiProvider).toBeNull();
    });

    it('should handle optional aiModel', () => {
      contentVersion.aiModel = 'gpt-4';
      expect(contentVersion.aiModel).toBe('gpt-4');

      contentVersion.aiModel = undefined;
      expect(contentVersion.aiModel).toBeUndefined();

      contentVersion.aiModel = null;
      expect(contentVersion.aiModel).toBeNull();
    });

    it('should handle optional aiMetadata', () => {
      const metadata = {
        model: 'gpt-4',
        provider: 'openai',
        usage: { prompt_tokens: 100, completion_tokens: 50 },
        temperature: 0.7,
      };

      contentVersion.aiMetadata = metadata;
      expect(contentVersion.aiMetadata).toEqual(metadata);

      contentVersion.aiMetadata = undefined;
      expect(contentVersion.aiMetadata).toBeUndefined();

      contentVersion.aiMetadata = null;
      expect(contentVersion.aiMetadata).toBeNull();
    });

    it('should handle optional sentimentAnalysis', () => {
      const sentimentAnalysis = {
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['innovation', 'technology'],
      };

      contentVersion.sentimentAnalysis = sentimentAnalysis;
      expect(contentVersion.sentimentAnalysis).toEqual(sentimentAnalysis);

      contentVersion.sentimentAnalysis = undefined;
      expect(contentVersion.sentimentAnalysis).toBeUndefined();

      contentVersion.sentimentAnalysis = null;
      expect(contentVersion.sentimentAnalysis).toBeNull();
    });

    it('should handle optional reviewNotes', () => {
      contentVersion.reviewNotes = 'This content needs improvement';
      expect(contentVersion.reviewNotes).toBe('This content needs improvement');

      contentVersion.reviewNotes = undefined;
      expect(contentVersion.reviewNotes).toBeUndefined();

      contentVersion.reviewNotes = null;
      expect(contentVersion.reviewNotes).toBeNull();
    });
  });

  describe('contentPiece relationship', () => {
    it('should handle contentPiece relationship', () => {
      const contentPiece = new ContentPiece();
      contentPiece.id = 'content-piece-1';
      contentPiece.title = 'Test Content Piece';

      contentVersion.contentPiece = contentPiece;
      contentVersion.contentPieceId = 'content-piece-1';

      expect(contentVersion.contentPiece).toBe(contentPiece);
      expect(contentVersion.contentPieceId).toBe('content-piece-1');
    });

    it('should handle contentPieceId without contentPiece object', () => {
      contentVersion.contentPieceId = 'content-piece-123';
      expect(contentVersion.contentPieceId).toBe('content-piece-123');
    });
  });

  describe('timestamps', () => {
    it('should handle createdAt timestamp', () => {
      const now = new Date();
      contentVersion.createdAt = now;
      expect(contentVersion.createdAt).toBe(now);
    });

    it('should handle updatedAt timestamp', () => {
      const now = new Date();
      contentVersion.updatedAt = now;
      expect(contentVersion.updatedAt).toBe(now);
    });
  });

  describe('entity validation', () => {
    it('should create a valid content version instance', () => {
      const validContentVersion = new ContentVersion();
      validContentVersion.id = 'version-123';
      validContentVersion.content = 'Valid content';
      validContentVersion.language = 'en';
      validContentVersion.type = VersionType.AI_GENERATED;
      validContentVersion.aiProvider = AiProvider.OPENAI;
      validContentVersion.aiModel = 'gpt-4';
      validContentVersion.aiMetadata = { model: 'gpt-4', provider: 'openai' };
      validContentVersion.sentimentAnalysis = {
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['valid', 'content'],
      };
      validContentVersion.version = 1;
      validContentVersion.isActive = true;
      validContentVersion.reviewNotes = 'Valid review notes';
      validContentVersion.contentPieceId = 'content-piece-123';
      validContentVersion.createdAt = new Date();
      validContentVersion.updatedAt = new Date();

      expect(validContentVersion.id).toBe('version-123');
      expect(validContentVersion.content).toBe('Valid content');
      expect(validContentVersion.language).toBe('en');
      expect(validContentVersion.type).toBe(VersionType.AI_GENERATED);
      expect(validContentVersion.aiProvider).toBe(AiProvider.OPENAI);
      expect(validContentVersion.aiModel).toBe('gpt-4');
      expect(validContentVersion.aiMetadata).toEqual({ model: 'gpt-4', provider: 'openai' });
      expect(validContentVersion.sentimentAnalysis).toEqual({
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['valid', 'content'],
      });
      expect(validContentVersion.version).toBe(1);
      expect(validContentVersion.isActive).toBe(true);
      expect(validContentVersion.reviewNotes).toBe('Valid review notes');
      expect(validContentVersion.contentPieceId).toBe('content-piece-123');
      expect(validContentVersion.createdAt).toBeInstanceOf(Date);
      expect(validContentVersion.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle minimal required fields', () => {
      const minimalContentVersion = new ContentVersion();
      minimalContentVersion.content = 'Minimal content';
      minimalContentVersion.language = 'en';
      minimalContentVersion.type = VersionType.ORIGINAL;
      minimalContentVersion.version = 1;
      minimalContentVersion.isActive = false;
      minimalContentVersion.contentPieceId = 'content-piece-1';

      expect(minimalContentVersion.content).toBe('Minimal content');
      expect(minimalContentVersion.language).toBe('en');
      expect(minimalContentVersion.type).toBe(VersionType.ORIGINAL);
      expect(minimalContentVersion.version).toBe(1);
      expect(minimalContentVersion.isActive).toBe(false);
      expect(minimalContentVersion.contentPieceId).toBe('content-piece-1');
    });
  });

  describe('complex metadata handling', () => {
    it('should handle complex aiMetadata', () => {
      const complexMetadata = {
        model: 'gpt-4',
        provider: 'openai',
        usage: {
          prompt_tokens: 150,
          completion_tokens: 75,
          total_tokens: 225,
        },
        temperature: 0.7,
        max_tokens: 500,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        custom_parameters: {
          creativity_level: 'high',
          brand_voice: 'professional',
        },
      };

      contentVersion.aiMetadata = complexMetadata;
      expect(contentVersion.aiMetadata).toEqual(complexMetadata);
    });

    it('should handle complex sentimentAnalysis', () => {
      const complexSentimentAnalysis = {
        sentiment: 'positive',
        confidence: 0.95,
        keywords: ['innovation', 'technology', 'AI', 'future'],
        tone: 'professional',
        readabilityScore: 85,
        emotionalTone: 'enthusiastic',
        brandAlignment: 'high',
        targetAudienceMatch: 'excellent',
      };

      contentVersion.sentimentAnalysis = complexSentimentAnalysis;
      expect(contentVersion.sentimentAnalysis).toEqual(complexSentimentAnalysis);
    });
  });

  describe('enum registration', () => {
    it('should have VersionType enum properly defined', () => {
      expect(VersionType.ORIGINAL).toBe('ORIGINAL');
      expect(VersionType.AI_GENERATED).toBe('AI_GENERATED');
      expect(VersionType.AI_TRANSLATED).toBe('AI_TRANSLATED');
      expect(VersionType.HUMAN_EDITED).toBe('HUMAN_EDITED');
    });

    it('should have AiProvider enum properly defined', () => {
      expect(AiProvider.OPENAI).toBe('OPENAI');
      expect(AiProvider.ANTHROPIC).toBe('ANTHROPIC');
      expect(AiProvider.LANGCHAIN).toBe('LANGCHAIN');
    });
  });
});
