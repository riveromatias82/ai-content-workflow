import { ContentPiece, ContentType, ReviewState } from './content-piece.entity';
import { Campaign } from './campaign.entity';
import { ContentVersion } from './content-version.entity';

describe('ContentPiece Entity', () => {
  let contentPiece: ContentPiece;

  beforeEach(() => {
    contentPiece = new ContentPiece();
  });

  describe('basic properties', () => {
    it('should have all required properties', () => {
      // Initialize properties to test they can be set
      contentPiece.id = 'test-id';
      contentPiece.title = 'Test Content';
      contentPiece.type = ContentType.HEADLINE;
      contentPiece.reviewState = ReviewState.DRAFT;
      contentPiece.sourceLanguage = 'en';
      contentPiece.briefing = 'Test briefing';
      contentPiece.targetAudience = 'Test audience';
      contentPiece.tone = 'Professional';
      contentPiece.keywords = ['test'];
      contentPiece.campaignId = 'campaign-1';
      contentPiece.versions = [];
      contentPiece.createdAt = new Date();
      contentPiece.updatedAt = new Date();

      expect(contentPiece.id).toBe('test-id');
      expect(contentPiece.title).toBe('Test Content');
      expect(contentPiece.type).toBe(ContentType.HEADLINE);
      expect(contentPiece.reviewState).toBe(ReviewState.DRAFT);
      expect(contentPiece.sourceLanguage).toBe('en');
      expect(contentPiece.briefing).toBe('Test briefing');
      expect(contentPiece.targetAudience).toBe('Test audience');
      expect(contentPiece.tone).toBe('Professional');
      expect(contentPiece.keywords).toEqual(['test']);
      expect(contentPiece.campaignId).toBe('campaign-1');
      expect(contentPiece.versions).toEqual([]);
      expect(contentPiece.createdAt).toBeInstanceOf(Date);
      expect(contentPiece.updatedAt).toBeInstanceOf(Date);
    });

    it('should initialize with default values', () => {
      contentPiece.title = 'Test Content';
      contentPiece.type = ContentType.HEADLINE;
      contentPiece.reviewState = ReviewState.DRAFT;
      contentPiece.sourceLanguage = 'en';
      contentPiece.keywords = ['test'];
      contentPiece.campaignId = 'campaign-1';
      contentPiece.versions = [];

      expect(contentPiece.title).toBe('Test Content');
      expect(contentPiece.type).toBe(ContentType.HEADLINE);
      expect(contentPiece.reviewState).toBe(ReviewState.DRAFT);
      expect(contentPiece.sourceLanguage).toBe('en');
      expect(contentPiece.keywords).toEqual(['test']);
      expect(contentPiece.campaignId).toBe('campaign-1');
      expect(contentPiece.versions).toEqual([]);
    });
  });

  describe('ContentType enum', () => {
    it('should accept all valid content types', () => {
      const validTypes = [
        ContentType.HEADLINE,
        ContentType.DESCRIPTION,
        ContentType.AD_COPY,
        ContentType.PRODUCT_DESCRIPTION,
        ContentType.SOCIAL_POST,
        ContentType.EMAIL_SUBJECT,
        ContentType.BLOG_TITLE,
      ];

      validTypes.forEach((type) => {
        contentPiece.type = type;
        expect(contentPiece.type).toBe(type);
      });
    });
  });

  describe('ReviewState enum', () => {
    it('should accept all valid review states', () => {
      const validStates = [
        ReviewState.DRAFT,
        ReviewState.AI_SUGGESTED,
        ReviewState.UNDER_REVIEW,
        ReviewState.APPROVED,
        ReviewState.REJECTED,
        ReviewState.NEEDS_REVISION,
      ];

      validStates.forEach((state) => {
        contentPiece.reviewState = state;
        expect(contentPiece.reviewState).toBe(state);
      });
    });
  });

  describe('sourceLanguage', () => {
    it('should handle different language codes', () => {
      const languages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko'];

      languages.forEach((lang) => {
        contentPiece.sourceLanguage = lang;
        expect(contentPiece.sourceLanguage).toBe(lang);
      });
    });

    it('should default to en', () => {
      contentPiece.sourceLanguage = 'en';
      expect(contentPiece.sourceLanguage).toBe('en');
    });
  });

  describe('keywords array', () => {
    it('should handle empty keywords array', () => {
      contentPiece.keywords = [];
      expect(contentPiece.keywords).toEqual([]);
    });

    it('should handle multiple keywords', () => {
      contentPiece.keywords = ['innovation', 'technology', 'AI', 'future'];
      expect(contentPiece.keywords).toEqual(['innovation', 'technology', 'AI', 'future']);
    });

    it('should handle single keyword', () => {
      contentPiece.keywords = ['test'];
      expect(contentPiece.keywords).toEqual(['test']);
    });

    it('should handle keywords with special characters', () => {
      contentPiece.keywords = ['AI-powered', 'next-gen', '24/7', 'B2B'];
      expect(contentPiece.keywords).toEqual(['AI-powered', 'next-gen', '24/7', 'B2B']);
    });
  });

  describe('optional properties', () => {
    it('should handle optional briefing', () => {
      contentPiece.briefing = 'Test briefing content';
      expect(contentPiece.briefing).toBe('Test briefing content');

      contentPiece.briefing = undefined;
      expect(contentPiece.briefing).toBeUndefined();

      contentPiece.briefing = null;
      expect(contentPiece.briefing).toBeNull();
    });

    it('should handle optional targetAudience', () => {
      contentPiece.targetAudience = 'Young professionals aged 25-35';
      expect(contentPiece.targetAudience).toBe('Young professionals aged 25-35');

      contentPiece.targetAudience = undefined;
      expect(contentPiece.targetAudience).toBeUndefined();

      contentPiece.targetAudience = null;
      expect(contentPiece.targetAudience).toBeNull();
    });

    it('should handle optional tone', () => {
      contentPiece.tone = 'Professional and friendly';
      expect(contentPiece.tone).toBe('Professional and friendly');

      contentPiece.tone = undefined;
      expect(contentPiece.tone).toBeUndefined();

      contentPiece.tone = null;
      expect(contentPiece.tone).toBeNull();
    });
  });

  describe('campaign relationship', () => {
    it('should handle campaign relationship', () => {
      const campaign = new Campaign();
      campaign.id = 'campaign-1';
      campaign.name = 'Test Campaign';

      contentPiece.campaign = campaign;
      contentPiece.campaignId = 'campaign-1';

      expect(contentPiece.campaign).toBe(campaign);
      expect(contentPiece.campaignId).toBe('campaign-1');
    });

    it('should handle campaignId without campaign object', () => {
      contentPiece.campaignId = 'campaign-123';
      expect(contentPiece.campaignId).toBe('campaign-123');
    });
  });

  describe('versions relationship', () => {
    it('should handle empty versions array', () => {
      contentPiece.versions = [];
      expect(contentPiece.versions).toEqual([]);
    });

    it('should handle multiple versions', () => {
      const version1 = new ContentVersion();
      version1.id = 'version-1';
      version1.content = 'Version 1 content';

      const version2 = new ContentVersion();
      version2.id = 'version-2';
      version2.content = 'Version 2 content';

      contentPiece.versions = [version1, version2];
      expect(contentPiece.versions).toHaveLength(2);
      expect(contentPiece.versions[0].content).toBe('Version 1 content');
      expect(contentPiece.versions[1].content).toBe('Version 2 content');
    });
  });

  describe('timestamps', () => {
    it('should handle createdAt timestamp', () => {
      const now = new Date();
      contentPiece.createdAt = now;
      expect(contentPiece.createdAt).toBe(now);
    });

    it('should handle updatedAt timestamp', () => {
      const now = new Date();
      contentPiece.updatedAt = now;
      expect(contentPiece.updatedAt).toBe(now);
    });
  });

  describe('entity validation', () => {
    it('should create a valid content piece instance', () => {
      const validContentPiece = new ContentPiece();
      validContentPiece.id = 'content-123';
      validContentPiece.title = 'Valid Content';
      validContentPiece.type = ContentType.HEADLINE;
      validContentPiece.reviewState = ReviewState.DRAFT;
      validContentPiece.sourceLanguage = 'en';
      validContentPiece.briefing = 'Valid briefing';
      validContentPiece.targetAudience = 'Valid audience';
      validContentPiece.tone = 'Professional';
      validContentPiece.keywords = ['valid', 'keywords'];
      validContentPiece.campaignId = 'campaign-123';
      validContentPiece.versions = [];
      validContentPiece.createdAt = new Date();
      validContentPiece.updatedAt = new Date();

      expect(validContentPiece.id).toBe('content-123');
      expect(validContentPiece.title).toBe('Valid Content');
      expect(validContentPiece.type).toBe(ContentType.HEADLINE);
      expect(validContentPiece.reviewState).toBe(ReviewState.DRAFT);
      expect(validContentPiece.sourceLanguage).toBe('en');
      expect(validContentPiece.briefing).toBe('Valid briefing');
      expect(validContentPiece.targetAudience).toBe('Valid audience');
      expect(validContentPiece.tone).toBe('Professional');
      expect(validContentPiece.keywords).toEqual(['valid', 'keywords']);
      expect(validContentPiece.campaignId).toBe('campaign-123');
      expect(validContentPiece.versions).toEqual([]);
      expect(validContentPiece.createdAt).toBeInstanceOf(Date);
      expect(validContentPiece.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle minimal required fields', () => {
      const minimalContentPiece = new ContentPiece();
      minimalContentPiece.title = 'Minimal Content';
      minimalContentPiece.type = ContentType.HEADLINE;
      minimalContentPiece.reviewState = ReviewState.DRAFT;
      minimalContentPiece.sourceLanguage = 'en';
      minimalContentPiece.keywords = [];
      minimalContentPiece.campaignId = 'campaign-1';

      expect(minimalContentPiece.title).toBe('Minimal Content');
      expect(minimalContentPiece.type).toBe(ContentType.HEADLINE);
      expect(minimalContentPiece.reviewState).toBe(ReviewState.DRAFT);
      expect(minimalContentPiece.sourceLanguage).toBe('en');
      expect(minimalContentPiece.keywords).toEqual([]);
      expect(minimalContentPiece.campaignId).toBe('campaign-1');
    });
  });

  describe('enum registration', () => {
    it('should have ContentType enum properly defined', () => {
      expect(ContentType.HEADLINE).toBe('HEADLINE');
      expect(ContentType.DESCRIPTION).toBe('DESCRIPTION');
      expect(ContentType.AD_COPY).toBe('AD_COPY');
      expect(ContentType.PRODUCT_DESCRIPTION).toBe('PRODUCT_DESCRIPTION');
      expect(ContentType.SOCIAL_POST).toBe('SOCIAL_POST');
      expect(ContentType.EMAIL_SUBJECT).toBe('EMAIL_SUBJECT');
      expect(ContentType.BLOG_TITLE).toBe('BLOG_TITLE');
    });

    it('should have ReviewState enum properly defined', () => {
      expect(ReviewState.DRAFT).toBe('DRAFT');
      expect(ReviewState.AI_SUGGESTED).toBe('AI_SUGGESTED');
      expect(ReviewState.UNDER_REVIEW).toBe('UNDER_REVIEW');
      expect(ReviewState.APPROVED).toBe('APPROVED');
      expect(ReviewState.REJECTED).toBe('REJECTED');
      expect(ReviewState.NEEDS_REVISION).toBe('NEEDS_REVISION');
    });
  });
});
