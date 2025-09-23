import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Repository } from 'typeorm';
import {
  ContentService,
  CreateContentPieceInput,
  UpdateContentPieceInput,
  GenerateAiContentInput,
  TranslateContentInput,
} from './content.service';
import { ContentPiece, ContentType, ReviewState } from '../../entities/content-piece.entity';
import { ContentVersion, VersionType, AiProvider } from '../../entities/content-version.entity';
import { Campaign } from '../../entities/campaign.entity';
import { AiService } from '../ai/ai.service';
import {
  CampaignFixture,
  ContentPieceFixture,
  ContentVersionFixture,
} from '../../test/fixtures/campaign.fixture';
import { createMockAiService } from '../../test/mocks/ai-service.mock';

describe('ContentService', () => {
  let service: ContentService;
  let contentPiecesRepository: jest.Mocked<Repository<ContentPiece>>;
  let contentVersionsRepository: jest.Mocked<Repository<ContentVersion>>;
  let campaignsRepository: jest.Mocked<Repository<Campaign>>;
  let aiService: jest.Mocked<AiService> & {
    mockGenerateContentSuccess: (content?: string) => void;
    mockGenerateContentError: (error?: Error) => void;
    mockTranslateContentSuccess: (content?: string) => void;
    mockAnalyzeContentSuccess: (analysis?: {
      sentiment: string;
      confidence: number;
      keywords: string[];
      tone: string;
      readabilityScore: number;
    }) => void;
  };

  beforeEach(async () => {
    const mockContentPiecesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockContentVersionsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      update: jest.fn(),
    };

    const mockCampaignsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    const mockAiService = createMockAiService();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContentService,
        {
          provide: getRepositoryToken(ContentPiece),
          useValue: mockContentPiecesRepository,
        },
        {
          provide: getRepositoryToken(ContentVersion),
          useValue: mockContentVersionsRepository,
        },
        {
          provide: getRepositoryToken(Campaign),
          useValue: mockCampaignsRepository,
        },
        {
          provide: AiService,
          useValue: mockAiService,
        },
      ],
    }).compile();

    service = module.get<ContentService>(ContentService);
    contentPiecesRepository = module.get(getRepositoryToken(ContentPiece));
    contentVersionsRepository = module.get(getRepositoryToken(ContentVersion));
    campaignsRepository = module.get(getRepositoryToken(Campaign));
    aiService = module.get(AiService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all content pieces with relations', async () => {
      const mockContentPieces = [
        ContentPieceFixture.create({ id: 'content-1' }),
        ContentPieceFixture.create({ id: 'content-2' }),
      ];

      contentPiecesRepository.find.mockResolvedValue(mockContentPieces);

      const result = await service.findAll();

      expect(result).toEqual(mockContentPieces);
      expect(contentPiecesRepository.find).toHaveBeenCalledWith({
        relations: ['campaign', 'versions'],
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('should return a content piece when found', async () => {
      const mockContentPiece = ContentPieceFixture.create({ id: 'content-1' });
      contentPiecesRepository.findOne.mockResolvedValue(mockContentPiece);

      const result = await service.findOne('content-1');

      expect(result).toEqual(mockContentPiece);
      expect(contentPiecesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'content-1' },
        relations: ['campaign', 'versions'],
      });
    });

    it('should throw NotFoundException when content piece not found', async () => {
      contentPiecesRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Content piece with ID non-existent not found'),
      );
    });
  });

  describe('findByCampaign', () => {
    it('should return content pieces for a specific campaign', async () => {
      const mockContentPieces = [
        ContentPieceFixture.create({ campaignId: 'campaign-1' }),
        ContentPieceFixture.create({ campaignId: 'campaign-1' }),
      ];

      contentPiecesRepository.find.mockResolvedValue(mockContentPieces);

      const result = await service.findByCampaign('campaign-1');

      expect(result).toEqual(mockContentPieces);
      expect(contentPiecesRepository.find).toHaveBeenCalledWith({
        where: { campaignId: 'campaign-1' },
        relations: ['campaign', 'versions'],
        order: { updatedAt: 'DESC' },
      });
    });
  });

  describe('create', () => {
    it('should create a new content piece successfully', async () => {
      const createInput: CreateContentPieceInput = {
        campaignId: 'campaign-1',
        title: 'New Content',
        type: ContentType.HEADLINE,
        briefing: 'Content briefing',
        targetAudience: 'General audience',
        tone: 'Professional',
        keywords: ['keyword1', 'keyword2'],
        sourceLanguage: 'en',
      };

      const mockCampaign = CampaignFixture.create({ id: 'campaign-1' });
      const mockContentPiece = ContentPieceFixture.create({
        ...createInput,
        sourceLanguage: 'en',
        keywords: ['keyword1', 'keyword2'],
      });

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      contentPiecesRepository.create.mockReturnValue(mockContentPiece);
      contentPiecesRepository.save.mockResolvedValue(mockContentPiece);
      // Mock the final findOne call that fetches the created content piece with relations
      contentPiecesRepository.findOne.mockResolvedValue(mockContentPiece);

      const result = await service.create(createInput);

      expect(result).toEqual(mockContentPiece);
      expect(campaignsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
      });
      expect(contentPiecesRepository.create).toHaveBeenCalledWith({
        ...createInput,
        sourceLanguage: 'en',
        keywords: ['keyword1', 'keyword2'],
      });
    });

    it('should throw BadRequestException when campaign not found', async () => {
      const createInput: CreateContentPieceInput = {
        campaignId: 'non-existent',
        title: 'New Content',
        type: ContentType.HEADLINE,
      };

      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.create(createInput)).rejects.toThrow(
        new BadRequestException('Campaign with ID non-existent not found'),
      );
    });

    it('should use default values for optional fields', async () => {
      const createInput: CreateContentPieceInput = {
        campaignId: 'campaign-1',
        title: 'New Content',
        type: ContentType.HEADLINE,
      };

      const mockCampaign = CampaignFixture.create({ id: 'campaign-1' });
      const mockContentPiece = ContentPieceFixture.create({
        ...createInput,
        sourceLanguage: 'en',
        keywords: [],
      });

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);
      contentPiecesRepository.create.mockReturnValue(mockContentPiece);
      contentPiecesRepository.save.mockResolvedValue(mockContentPiece);

      await service.create(createInput);

      expect(contentPiecesRepository.create).toHaveBeenCalledWith({
        ...createInput,
        sourceLanguage: 'en',
        keywords: [],
      });
    });
  });

  describe('update', () => {
    it('should update an existing content piece', async () => {
      const existingContentPiece = ContentPieceFixture.create({
        id: 'content-1',
        title: 'Old Title',
      });

      const updateInput: UpdateContentPieceInput = {
        title: 'Updated Title',
        reviewState: ReviewState.APPROVED,
      };

      const updatedContentPiece = ContentPieceFixture.create({
        id: 'content-1',
        title: 'Updated Title',
        reviewState: ReviewState.APPROVED,
      });

      contentPiecesRepository.findOne.mockResolvedValue(existingContentPiece);
      contentPiecesRepository.save.mockResolvedValue(updatedContentPiece);

      const result = await service.update('content-1', updateInput);

      expect(result).toEqual(updatedContentPiece);
      expect(contentPiecesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'content-1',
          title: 'Updated Title',
          reviewState: ReviewState.APPROVED,
        }),
      );
    });
  });

  describe('remove', () => {
    it('should delete a content piece successfully', async () => {
      contentPiecesRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.remove('content-1');

      expect(result).toBe(true);
      expect(contentPiecesRepository.delete).toHaveBeenCalledWith('content-1');
    });

    it('should return false when content piece not found', async () => {
      contentPiecesRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.remove('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('generateAiContent', () => {
    it('should generate AI content successfully', async () => {
      const input: GenerateAiContentInput = {
        contentPieceId: 'content-1',
        provider: AiProvider.OPENAI,
      };

      const mockContentPiece = ContentPieceFixture.create({
        id: 'content-1',
        type: ContentType.HEADLINE,
        briefing: 'Test briefing',
        targetAudience: 'Test audience',
        tone: 'Professional',
        keywords: ['test'],
        sourceLanguage: 'en',
      });

      const mockVersion = ContentVersionFixture.create({
        contentPieceId: 'content-1',
        content: 'AI Generated Content',
        type: VersionType.AI_GENERATED,
        aiProvider: AiProvider.OPENAI,
        version: 1,
        isActive: false,
      });

      const mockAnalysis = {
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['test'],
        tone: 'professional',
        readabilityScore: 75,
      };

      contentPiecesRepository.findOne.mockResolvedValue(mockContentPiece);
      aiService.mockGenerateContentSuccess('AI Generated Content');
      aiService.mockAnalyzeContentSuccess(mockAnalysis);
      contentVersionsRepository.create.mockReturnValue(mockVersion);
      contentVersionsRepository.save.mockResolvedValue(mockVersion);
      contentPiecesRepository.save.mockResolvedValue(mockContentPiece);
      // Mock findOne to return null for getNextVersionNumber (no existing versions)
      // and then return the mock version for the final findOne call
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(null) // for getNextVersionNumber
        .mockResolvedValueOnce(mockVersion); // for the final return

      const result = await service.generateAiContent(input);

      expect(result).toEqual(mockVersion);
      expect(aiService.generateContent).toHaveBeenCalledWith({
        type: ContentType.HEADLINE,
        briefing: 'Test briefing',
        targetAudience: 'Test audience',
        tone: 'Professional',
        keywords: ['test'],
        language: 'en',
        provider: AiProvider.OPENAI,
      });
      expect(aiService.analyzeContent).toHaveBeenCalledWith('AI Generated Content');
      expect(contentVersionsRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contentPieceId: 'content-1',
          content: 'AI Generated Content',
          type: VersionType.AI_GENERATED,
          aiProvider: AiProvider.OPENAI,
          sentimentAnalysis: mockAnalysis,
          version: 1,
          isActive: false,
        }),
      );
    });

    it('should throw NotFoundException when content piece not found', async () => {
      const input: GenerateAiContentInput = {
        contentPieceId: 'non-existent',
      };

      contentPiecesRepository.findOne.mockResolvedValue(null);

      await expect(service.generateAiContent(input)).rejects.toThrow(
        new NotFoundException('Content piece with ID non-existent not found'),
      );
    });

    it('should handle AI service errors', async () => {
      const input: GenerateAiContentInput = {
        contentPieceId: 'content-1',
      };

      const mockContentPiece = ContentPieceFixture.create({ id: 'content-1' });
      contentPiecesRepository.findOne.mockResolvedValue(mockContentPiece);
      aiService.mockGenerateContentError(new Error('AI service error'));

      await expect(service.generateAiContent(input)).rejects.toThrow('AI service error');
    });
  });

  describe('translateContent', () => {
    it('should translate content successfully', async () => {
      const input: TranslateContentInput = {
        contentVersionId: 'version-1',
        targetLanguage: 'es',
        provider: AiProvider.OPENAI,
      };

      const mockSourceVersion = ContentVersionFixture.create({
        id: 'version-1',
        content: 'Hello World',
        language: 'en',
        contentPieceId: 'content-1',
        contentPiece: ContentPieceFixture.create({
          id: 'content-1',
          briefing: 'Test briefing',
        }),
      });

      const mockTranslatedVersion = ContentVersionFixture.create({
        contentPieceId: 'content-1',
        content: 'Hola Mundo',
        language: 'es',
        type: VersionType.AI_TRANSLATED,
        aiProvider: AiProvider.OPENAI,
        version: 2,
        isActive: false,
      });

      const mockAnalysis = {
        sentiment: 'positive',
        confidence: 0.8,
        keywords: ['hola', 'mundo'],
        tone: 'friendly',
        readabilityScore: 80,
      };

      aiService.mockTranslateContentSuccess('Hola Mundo');
      aiService.mockAnalyzeContentSuccess(mockAnalysis);
      contentVersionsRepository.create.mockReturnValue(mockTranslatedVersion);
      contentVersionsRepository.save.mockResolvedValue(mockTranslatedVersion);
      // Mock findOne calls: first for finding source version, then for getNextVersionNumber, then for final return
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(mockSourceVersion) // for finding source version
        .mockResolvedValueOnce(null) // for getNextVersionNumber (no existing versions)
        .mockResolvedValueOnce(mockTranslatedVersion); // for final return

      const result = await service.translateContent(input);

      expect(result).toEqual(mockTranslatedVersion);
      expect(aiService.translateContent).toHaveBeenCalledWith({
        content: 'Hello World',
        sourceLanguage: 'en',
        targetLanguage: 'es',
        context: 'Test briefing',
        provider: AiProvider.OPENAI,
      });
    });

    it('should throw NotFoundException when source version not found', async () => {
      const input: TranslateContentInput = {
        contentVersionId: 'non-existent',
        targetLanguage: 'es',
      };

      contentVersionsRepository.findOne.mockResolvedValue(null);

      await expect(service.translateContent(input)).rejects.toThrow(
        new NotFoundException('Content version with ID non-existent not found'),
      );
    });
  });

  describe('createManualVersion', () => {
    it('should create a manual version successfully', async () => {
      const contentPieceId = 'content-1';
      const content = 'Manual content';
      const language = 'en';

      const mockVersion = ContentVersionFixture.create({
        contentPieceId,
        content,
        language,
        type: VersionType.ORIGINAL,
        version: 1,
        isActive: true,
      });

      contentVersionsRepository.create.mockReturnValue(mockVersion);
      contentVersionsRepository.save.mockResolvedValue(mockVersion);
      // Mock findOne to return null for getNextVersionNumber (no existing versions)
      // and then return the mock version for the final findOne call
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(null) // for getNextVersionNumber
        .mockResolvedValueOnce(mockVersion); // for the final return

      const result = await service.createManualVersion(contentPieceId, content, language);

      expect(result).toEqual(mockVersion);
      expect(contentVersionsRepository.create).toHaveBeenCalledWith({
        contentPieceId,
        content,
        language,
        type: VersionType.ORIGINAL,
        version: 1,
        isActive: true,
      });
    });

    it('should use default language when not provided', async () => {
      const contentPieceId = 'content-1';
      const content = 'Manual content';

      const mockVersion = ContentVersionFixture.create({
        contentPieceId,
        content,
        language: 'en',
        type: VersionType.ORIGINAL,
        version: 1,
        isActive: true,
      });

      contentVersionsRepository.create.mockReturnValue(mockVersion);
      contentVersionsRepository.save.mockResolvedValue(mockVersion);
      // Mock findOne to return null for getNextVersionNumber (no existing versions)
      // and then return the mock version for the final findOne call
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(null) // for getNextVersionNumber
        .mockResolvedValueOnce(mockVersion); // for the final return

      await service.createManualVersion(contentPieceId, content);

      expect(contentVersionsRepository.create).toHaveBeenCalledWith({
        contentPieceId,
        content,
        language: 'en',
        type: VersionType.ORIGINAL,
        version: 1,
        isActive: true,
      });
    });
  });

  describe('updateVersion', () => {
    it('should update a version successfully', async () => {
      const versionId = 'version-1';
      const content = 'Updated content';
      const reviewNotes = 'Review notes';

      const existingVersion = ContentVersionFixture.create({
        id: versionId,
        content: 'Original content',
        type: VersionType.ORIGINAL,
      });

      const updatedVersion = ContentVersionFixture.create({
        id: versionId,
        content,
        type: VersionType.HUMAN_EDITED,
        reviewNotes,
      });

      contentVersionsRepository.findOne.mockResolvedValue(existingVersion);
      contentVersionsRepository.save.mockResolvedValue(updatedVersion);
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(existingVersion)
        .mockResolvedValueOnce(updatedVersion);

      const result = await service.updateVersion(versionId, content, reviewNotes);

      expect(result).toEqual(updatedVersion);
      expect(contentVersionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: versionId,
          content,
          type: VersionType.HUMAN_EDITED,
          reviewNotes,
        }),
      );
    });

    it('should throw NotFoundException when version not found', async () => {
      contentVersionsRepository.findOne.mockResolvedValue(null);

      await expect(service.updateVersion('non-existent', 'content')).rejects.toThrow(
        new NotFoundException('Content version with ID non-existent not found'),
      );
    });
  });

  describe('setActiveVersion', () => {
    it('should set a version as active successfully', async () => {
      const versionId = 'version-1';
      const contentPieceId = 'content-1';

      const existingVersion = ContentVersionFixture.create({
        id: versionId,
        contentPieceId,
        isActive: false,
      });

      const updatedVersion = ContentVersionFixture.create({
        id: versionId,
        contentPieceId,
        isActive: true,
      });

      contentVersionsRepository.findOne.mockResolvedValue(existingVersion);
      contentVersionsRepository.update.mockResolvedValue({
        affected: 2,
        generatedMaps: [],
        raw: [],
      });
      contentVersionsRepository.save.mockResolvedValue(updatedVersion);
      contentVersionsRepository.findOne
        .mockResolvedValueOnce(existingVersion)
        .mockResolvedValueOnce(updatedVersion);

      const result = await service.setActiveVersion(versionId);

      expect(result).toEqual(updatedVersion);
      expect(contentVersionsRepository.update).toHaveBeenCalledWith(
        { contentPieceId },
        { isActive: false },
      );
      expect(contentVersionsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: versionId,
          isActive: true,
        }),
      );
    });

    it('should throw NotFoundException when version not found', async () => {
      contentVersionsRepository.findOne.mockResolvedValue(null);

      await expect(service.setActiveVersion('non-existent')).rejects.toThrow(
        new NotFoundException('Content version with ID non-existent not found'),
      );
    });
  });

  describe('getNextVersionNumber', () => {
    it('should return 1 for first version', async () => {
      const contentPieceId = 'content-1';
      contentVersionsRepository.findOne.mockResolvedValue(null);

      const result = await service['getNextVersionNumber'](contentPieceId);

      expect(result).toBe(1);
      expect(contentVersionsRepository.findOne).toHaveBeenCalledWith({
        where: { contentPieceId },
        order: { version: 'DESC' },
      });
    });

    it('should return next version number', async () => {
      const contentPieceId = 'content-1';
      const lastVersion = ContentVersionFixture.create({
        contentPieceId,
        version: 3,
      });

      contentVersionsRepository.findOne.mockResolvedValue(lastVersion);

      const result = await service['getNextVersionNumber'](contentPieceId);

      expect(result).toBe(4);
    });
  });
});
