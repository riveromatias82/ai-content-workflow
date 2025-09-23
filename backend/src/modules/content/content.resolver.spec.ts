import { Test, TestingModule } from '@nestjs/testing';
import { ContentResolver } from './content.resolver';
import { ContentService } from './content.service';
import { ContentType, ReviewState } from '../../entities/content-piece.entity';
import { VersionType, AiProvider } from '../../entities/content-version.entity';
import { ContentPieceFixture, ContentVersionFixture } from '../../test/fixtures/campaign.fixture';

// Mock PubSub
jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
    asyncIterator: jest.fn().mockReturnValue({
      [Symbol.asyncIterator]: jest.fn(),
    }),
  })),
}));

describe('ContentResolver', () => {
  let resolver: ContentResolver;
  let contentService: jest.Mocked<ContentService>;

  beforeEach(async () => {
    const mockContentService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      findByCampaign: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      generateAiContent: jest.fn(),
      translateContent: jest.fn(),
      createManualVersion: jest.fn(),
      updateVersion: jest.fn(),
      setActiveVersion: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentResolver,
        {
          provide: ContentService,
          useValue: mockContentService,
        },
      ],
    }).compile();

    resolver = module.get<ContentResolver>(ContentResolver);
    contentService = module.get(ContentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('contentPieces', () => {
    it('should return all content pieces', async () => {
      const mockContentPieces = [
        ContentPieceFixture.create({ id: 'content-1' }),
        ContentPieceFixture.create({ id: 'content-2' }),
      ];

      contentService.findAll.mockResolvedValue(mockContentPieces);

      const result = await resolver.findAll();

      expect(result).toEqual(mockContentPieces);
      expect(contentService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no content pieces exist', async () => {
      contentService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('contentPiece', () => {
    it('should return a specific content piece', async () => {
      const mockContentPiece = ContentPieceFixture.create({ id: 'content-1' });
      contentService.findOne.mockResolvedValue(mockContentPiece);

      const result = await resolver.findOne('content-1');

      expect(result).toEqual(mockContentPiece);
      expect(contentService.findOne).toHaveBeenCalledWith('content-1');
    });

    it('should throw error when content piece not found', async () => {
      contentService.findOne.mockRejectedValue(new Error('Content piece not found'));

      await expect(resolver.findOne('non-existent')).rejects.toThrow('Content piece not found');
    });
  });

  describe('contentPiecesByCampaign', () => {
    it('should return content pieces for a specific campaign', async () => {
      const mockContentPieces = [
        ContentPieceFixture.create({ campaignId: 'campaign-1' }),
        ContentPieceFixture.create({ campaignId: 'campaign-1' }),
      ];

      contentService.findByCampaign.mockResolvedValue(mockContentPieces);

      const result = await resolver.findByCampaign('campaign-1');

      expect(result).toEqual(mockContentPieces);
      expect(contentService.findByCampaign).toHaveBeenCalledWith('campaign-1');
    });
  });

  describe('createContentPiece', () => {
    it('should create a new content piece and publish event', async () => {
      const createInput = {
        campaignId: 'campaign-1',
        title: 'New Content',
        type: ContentType.HEADLINE,
        briefing: 'Content briefing',
        targetAudience: 'General audience',
        tone: 'Professional',
        keywords: ['keyword1', 'keyword2'],
        sourceLanguage: 'en',
      };

      const mockContentPiece = ContentPieceFixture.create(createInput);
      contentService.create.mockResolvedValue(mockContentPiece);

      const result = await resolver.createContentPiece(createInput);

      expect(result).toEqual(mockContentPiece);
      expect(contentService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle creation errors', async () => {
      const createInput = {
        campaignId: 'campaign-1',
        title: 'New Content',
        type: ContentType.HEADLINE,
      };

      contentService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(resolver.createContentPiece(createInput)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateContentPiece', () => {
    it('should update a content piece and publish event', async () => {
      const updateInput = {
        title: 'Updated Content',
        reviewState: ReviewState.APPROVED,
      };

      const mockContentPiece = ContentPieceFixture.create({
        id: 'content-1',
        title: 'Updated Content',
        reviewState: ReviewState.APPROVED,
      });

      contentService.update.mockResolvedValue(mockContentPiece);

      const result = await resolver.updateContentPiece('content-1', updateInput);

      expect(result).toEqual(mockContentPiece);
      expect(contentService.update).toHaveBeenCalledWith('content-1', updateInput);
    });

    it('should handle update errors', async () => {
      const updateInput = {
        title: 'Updated Content',
      };

      contentService.update.mockRejectedValue(new Error('Update failed'));

      await expect(resolver.updateContentPiece('content-1', updateInput)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('removeContentPiece', () => {
    it('should remove a content piece and publish event when successful', async () => {
      contentService.remove.mockResolvedValue(true);

      const result = await resolver.removeContentPiece('content-1');

      expect(result).toBe(true);
      expect(contentService.remove).toHaveBeenCalledWith('content-1');
    });

    it('should return false when content piece not found', async () => {
      contentService.remove.mockResolvedValue(false);

      const result = await resolver.removeContentPiece('non-existent');

      expect(result).toBe(false);
    });

    it('should handle removal errors', async () => {
      contentService.remove.mockRejectedValue(new Error('Removal failed'));

      await expect(resolver.removeContentPiece('content-1')).rejects.toThrow('Removal failed');
    });
  });

  describe('generateAiContent', () => {
    it('should generate AI content and publish event', async () => {
      const generateInput = {
        contentPieceId: 'content-1',
        provider: AiProvider.OPENAI,
      };

      const mockVersion = ContentVersionFixture.create({
        contentPieceId: 'content-1',
        type: VersionType.AI_GENERATED,
        aiProvider: AiProvider.OPENAI,
      });

      contentService.generateAiContent.mockResolvedValue(mockVersion);

      const result = await resolver.generateAiContent(generateInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.generateAiContent).toHaveBeenCalledWith(generateInput);
    });

    it('should handle AI generation errors', async () => {
      const generateInput = {
        contentPieceId: 'content-1',
        provider: AiProvider.OPENAI,
      };

      contentService.generateAiContent.mockRejectedValue(new Error('AI generation failed'));

      await expect(resolver.generateAiContent(generateInput)).rejects.toThrow(
        'AI generation failed',
      );
    });
  });

  describe('translateContent', () => {
    it('should translate content and publish event', async () => {
      const translateInput = {
        contentVersionId: 'version-1',
        targetLanguage: 'es',
        provider: AiProvider.OPENAI,
      };

      const mockVersion = ContentVersionFixture.create({
        id: 'version-1',
        language: 'es',
        type: VersionType.AI_TRANSLATED,
        aiProvider: AiProvider.OPENAI,
      });

      contentService.translateContent.mockResolvedValue(mockVersion);

      const result = await resolver.translateContent(translateInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.translateContent).toHaveBeenCalledWith(translateInput);
    });

    it('should handle translation errors', async () => {
      const translateInput = {
        contentVersionId: 'version-1',
        targetLanguage: 'es',
      };

      contentService.translateContent.mockRejectedValue(new Error('Translation failed'));

      await expect(resolver.translateContent(translateInput)).rejects.toThrow('Translation failed');
    });
  });

  describe('createManualVersion', () => {
    it('should create a manual version and publish event', async () => {
      const createInput = {
        contentPieceId: 'content-1',
        content: 'Manual content',
        language: 'en',
      };

      const mockVersion = ContentVersionFixture.create({
        contentPieceId: 'content-1',
        content: 'Manual content',
        language: 'en',
        type: VersionType.ORIGINAL,
      });

      contentService.createManualVersion.mockResolvedValue(mockVersion);

      const result = await resolver.createManualVersion(createInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.createManualVersion).toHaveBeenCalledWith(
        'content-1',
        'Manual content',
        'en',
      );
    });

    it('should handle manual version creation errors', async () => {
      const createInput = {
        contentPieceId: 'content-1',
        content: 'Manual content',
      };

      contentService.createManualVersion.mockRejectedValue(
        new Error('Manual version creation failed'),
      );

      await expect(resolver.createManualVersion(createInput)).rejects.toThrow(
        'Manual version creation failed',
      );
    });
  });

  describe('updateVersion', () => {
    it('should update a version and publish event', async () => {
      const updateInput = {
        id: 'version-1',
        content: 'Updated content',
        reviewNotes: 'Review notes',
      };

      const mockVersion = ContentVersionFixture.create({
        id: 'version-1',
        content: 'Updated content',
        type: VersionType.HUMAN_EDITED,
        reviewNotes: 'Review notes',
      });

      contentService.updateVersion.mockResolvedValue(mockVersion);

      const result = await resolver.updateVersion(updateInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.updateVersion).toHaveBeenCalledWith(
        'version-1',
        'Updated content',
        'Review notes',
      );
    });

    it('should handle version update errors', async () => {
      const updateInput = {
        id: 'version-1',
        content: 'Updated content',
      };

      contentService.updateVersion.mockRejectedValue(new Error('Version update failed'));

      await expect(resolver.updateVersion(updateInput)).rejects.toThrow('Version update failed');
    });
  });

  describe('setActiveVersion', () => {
    it('should set a version as active and publish event', async () => {
      const mockVersion = ContentVersionFixture.create({
        id: 'version-1',
        isActive: true,
      });

      contentService.setActiveVersion.mockResolvedValue(mockVersion);

      const result = await resolver.setActiveVersion('version-1');

      expect(result).toEqual(mockVersion);
      expect(contentService.setActiveVersion).toHaveBeenCalledWith('version-1');
    });

    it('should handle set active version errors', async () => {
      contentService.setActiveVersion.mockRejectedValue(new Error('Set active version failed'));

      await expect(resolver.setActiveVersion('version-1')).rejects.toThrow(
        'Set active version failed',
      );
    });
  });

  describe('subscriptions', () => {
    it('should return contentPieceCreated subscription iterator', () => {
      const iterator = resolver.contentPieceCreated();
      expect(iterator).toBeDefined();
    });

    it('should return contentPieceUpdated subscription iterator', () => {
      const iterator = resolver.contentPieceUpdated();
      expect(iterator).toBeDefined();
    });

    it('should return aiContentGenerated subscription iterator', () => {
      const iterator = resolver.aiContentGenerated();
      expect(iterator).toBeDefined();
    });

    it('should return contentTranslated subscription iterator', () => {
      const iterator = resolver.contentTranslated();
      expect(iterator).toBeDefined();
    });

    it('should return versionUpdated subscription iterator', () => {
      const iterator = resolver.versionUpdated();
      expect(iterator).toBeDefined();
    });

    it('should return activeVersionChanged subscription iterator', () => {
      const iterator = resolver.activeVersionChanged();
      expect(iterator).toBeDefined();
    });
  });

  describe('input validation', () => {
    it('should handle CreateContentPieceInputType with all fields', async () => {
      const createInput = {
        campaignId: 'campaign-1',
        title: 'Test Content',
        type: ContentType.HEADLINE,
        briefing: 'Test briefing',
        targetAudience: 'Test audience',
        tone: 'Professional',
        keywords: ['test', 'content'],
        sourceLanguage: 'en',
      };

      const mockContentPiece = ContentPieceFixture.create(createInput);
      contentService.create.mockResolvedValue(mockContentPiece);

      const result = await resolver.createContentPiece(createInput);

      expect(result).toEqual(mockContentPiece);
      expect(contentService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle CreateContentPieceInputType with minimal fields', async () => {
      const createInput = {
        campaignId: 'campaign-1',
        title: 'Test Content',
        type: ContentType.HEADLINE,
      };

      const mockContentPiece = ContentPieceFixture.create(createInput);
      contentService.create.mockResolvedValue(mockContentPiece);

      const result = await resolver.createContentPiece(createInput);

      expect(result).toEqual(mockContentPiece);
      expect(contentService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle UpdateContentPieceInputType with all fields', async () => {
      const updateInput = {
        title: 'Updated Content',
        briefing: 'Updated briefing',
        targetAudience: 'Updated audience',
        tone: 'Casual',
        keywords: ['updated', 'keywords'],
        reviewState: ReviewState.APPROVED,
      };

      const mockContentPiece = ContentPieceFixture.create(updateInput);
      contentService.update.mockResolvedValue(mockContentPiece);

      const result = await resolver.updateContentPiece('content-1', updateInput);

      expect(result).toEqual(mockContentPiece);
      expect(contentService.update).toHaveBeenCalledWith('content-1', updateInput);
    });

    it('should handle GenerateAiContentInputType', async () => {
      const generateInput = {
        contentPieceId: 'content-1',
        provider: AiProvider.ANTHROPIC,
      };

      const mockVersion = ContentVersionFixture.create({
        contentPieceId: 'content-1',
        aiProvider: AiProvider.ANTHROPIC,
      });

      contentService.generateAiContent.mockResolvedValue(mockVersion);

      const result = await resolver.generateAiContent(generateInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.generateAiContent).toHaveBeenCalledWith(generateInput);
    });

    it('should handle TranslateContentInputType', async () => {
      const translateInput = {
        contentVersionId: 'version-1',
        targetLanguage: 'fr',
        provider: AiProvider.OPENAI,
      };

      const mockVersion = ContentVersionFixture.create({
        id: 'version-1',
        language: 'fr',
        aiProvider: AiProvider.OPENAI,
      });

      contentService.translateContent.mockResolvedValue(mockVersion);

      const result = await resolver.translateContent(translateInput);

      expect(result).toEqual(mockVersion);
      expect(contentService.translateContent).toHaveBeenCalledWith(translateInput);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors in findAll', async () => {
      const error = new Error('Database connection failed');
      contentService.findAll.mockRejectedValue(error);

      await expect(resolver.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should propagate service errors in findOne', async () => {
      const error = new Error('Content piece not found');
      contentService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne('content-1')).rejects.toThrow('Content piece not found');
    });

    it('should propagate service errors in findByCampaign', async () => {
      const error = new Error('Campaign not found');
      contentService.findByCampaign.mockRejectedValue(error);

      await expect(resolver.findByCampaign('campaign-1')).rejects.toThrow('Campaign not found');
    });

    it('should propagate service errors in createContentPiece', async () => {
      const error = new Error('Content piece creation failed');
      contentService.create.mockRejectedValue(error);

      await expect(
        resolver.createContentPiece({
          campaignId: 'campaign-1',
          title: 'Test',
          type: ContentType.HEADLINE,
        }),
      ).rejects.toThrow('Content piece creation failed');
    });

    it('should propagate service errors in updateContentPiece', async () => {
      const error = new Error('Content piece update failed');
      contentService.update.mockRejectedValue(error);

      await expect(resolver.updateContentPiece('content-1', { title: 'Updated' })).rejects.toThrow(
        'Content piece update failed',
      );
    });

    it('should propagate service errors in removeContentPiece', async () => {
      const error = new Error('Content piece removal failed');
      contentService.remove.mockRejectedValue(error);

      await expect(resolver.removeContentPiece('content-1')).rejects.toThrow(
        'Content piece removal failed',
      );
    });

    it('should propagate service errors in generateAiContent', async () => {
      const error = new Error('AI content generation failed');
      contentService.generateAiContent.mockRejectedValue(error);

      await expect(
        resolver.generateAiContent({
          contentPieceId: 'content-1',
        }),
      ).rejects.toThrow('AI content generation failed');
    });

    it('should propagate service errors in translateContent', async () => {
      const error = new Error('Content translation failed');
      contentService.translateContent.mockRejectedValue(error);

      await expect(
        resolver.translateContent({
          contentVersionId: 'version-1',
          targetLanguage: 'es',
        }),
      ).rejects.toThrow('Content translation failed');
    });
  });
});
