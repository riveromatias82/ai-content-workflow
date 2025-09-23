import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { CampaignsService, CreateCampaignInput, UpdateCampaignInput } from './campaigns.service';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { ContentPiece, ReviewState } from '../../entities/content-piece.entity';
import { CampaignFixture, ContentPieceFixture } from '../../test/fixtures/campaign.fixture';

describe('CampaignsService', () => {
  let service: CampaignsService;
  let campaignsRepository: jest.Mocked<Repository<Campaign>>;
  // let contentPiecesRepository: jest.Mocked<Repository<ContentPiece>>; // Unused variable

  beforeEach(async () => {
    const mockCampaignsRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const mockContentPiecesRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsService,
        {
          provide: getRepositoryToken(Campaign),
          useValue: mockCampaignsRepository,
        },
        {
          provide: getRepositoryToken(ContentPiece),
          useValue: mockContentPiecesRepository,
        },
      ],
    }).compile();

    service = module.get<CampaignsService>(CampaignsService);
    campaignsRepository = module.get(getRepositoryToken(Campaign));
    // contentPiecesRepository = module.get(getRepositoryToken(ContentPiece)); // Unused variable
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all campaigns with relations', async () => {
      const mockCampaigns = [
        CampaignFixture.create({ id: 'campaign-1' }),
        CampaignFixture.create({ id: 'campaign-2' }),
      ];

      campaignsRepository.find.mockResolvedValue(mockCampaigns);

      const result = await service.findAll();

      expect(result).toEqual(mockCampaigns);
      expect(campaignsRepository.find).toHaveBeenCalledWith({
        relations: ['contentPieces', 'contentPieces.versions'],
        order: { updatedAt: 'DESC' },
      });
    });

    it('should return empty array when no campaigns exist', async () => {
      campaignsRepository.find.mockResolvedValue([]);

      const result = await service.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findOne', () => {
    it('should return a campaign when found', async () => {
      const mockCampaign = CampaignFixture.create({ id: 'campaign-1' });
      campaignsRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.findOne('campaign-1');

      expect(result).toEqual(mockCampaign);
      expect(campaignsRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'campaign-1' },
        relations: ['contentPieces', 'contentPieces.versions'],
      });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('non-existent')).rejects.toThrow(
        new NotFoundException('Campaign with ID non-existent not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a new campaign with default values', async () => {
      const createInput: CreateCampaignInput = {
        name: 'New Campaign',
        description: 'Campaign description',
      };

      const mockCampaign = CampaignFixture.create({
        name: 'New Campaign',
        description: 'Campaign description',
        targetLanguages: ['en'],
        targetMarkets: [],
      });

      campaignsRepository.create.mockReturnValue(mockCampaign);
      campaignsRepository.save.mockResolvedValue(mockCampaign);

      const result = await service.create(createInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsRepository.create).toHaveBeenCalledWith({
        name: 'New Campaign',
        description: 'Campaign description',
        targetLanguages: ['en'],
        targetMarkets: [],
      });
      expect(campaignsRepository.save).toHaveBeenCalledWith(mockCampaign);
    });

    it('should create a campaign with provided target languages and markets', async () => {
      const createInput: CreateCampaignInput = {
        name: 'New Campaign',
        targetLanguages: ['en', 'es', 'fr'],
        targetMarkets: ['US', 'UK', 'FR'],
      };

      const mockCampaign = CampaignFixture.create({
        name: 'New Campaign',
        targetLanguages: ['en', 'es', 'fr'],
        targetMarkets: ['US', 'UK', 'FR'],
      });

      campaignsRepository.create.mockReturnValue(mockCampaign);
      campaignsRepository.save.mockResolvedValue(mockCampaign);

      const result = await service.create(createInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsRepository.create).toHaveBeenCalledWith({
        name: 'New Campaign',
        targetLanguages: ['en', 'es', 'fr'],
        targetMarkets: ['US', 'UK', 'FR'],
      });
    });
  });

  describe('update', () => {
    it('should update an existing campaign', async () => {
      const existingCampaign = CampaignFixture.create({
        id: 'campaign-1',
        name: 'Old Name',
        status: CampaignStatus.DRAFT,
      });

      const updateInput: UpdateCampaignInput = {
        name: 'Updated Name',
        status: CampaignStatus.ACTIVE,
      };

      const updatedCampaign = CampaignFixture.create({
        id: 'campaign-1',
        name: 'Updated Name',
        status: CampaignStatus.ACTIVE,
      });

      campaignsRepository.findOne.mockResolvedValue(existingCampaign);
      campaignsRepository.save.mockResolvedValue(updatedCampaign);

      const result = await service.update('campaign-1', updateInput);

      expect(result).toEqual(updatedCampaign);
      expect(campaignsRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'campaign-1',
          name: 'Updated Name',
          status: CampaignStatus.ACTIVE,
        }),
      );
    });

    it('should throw NotFoundException when updating non-existent campaign', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'New Name' })).rejects.toThrow(
        new NotFoundException('Campaign with ID non-existent not found'),
      );
    });

    it('should update only provided fields', async () => {
      const existingCampaign = CampaignFixture.create({
        id: 'campaign-1',
        name: 'Original Name',
        description: 'Original Description',
        status: CampaignStatus.DRAFT,
      });

      const updateInput: UpdateCampaignInput = {
        name: 'Updated Name',
      };

      campaignsRepository.findOne.mockResolvedValue(existingCampaign);
      campaignsRepository.save.mockResolvedValue({
        ...existingCampaign,
        name: 'Updated Name',
      });

      const result = await service.update('campaign-1', updateInput);

      expect(result.name).toBe('Updated Name');
      expect(result.description).toBe('Original Description');
      expect(result.status).toBe(CampaignStatus.DRAFT);
    });
  });

  describe('remove', () => {
    it('should delete a campaign successfully', async () => {
      campaignsRepository.delete.mockResolvedValue({ affected: 1, raw: [] });

      const result = await service.remove('campaign-1');

      expect(result).toBe(true);
      expect(campaignsRepository.delete).toHaveBeenCalledWith('campaign-1');
    });

    it('should return false when campaign not found', async () => {
      campaignsRepository.delete.mockResolvedValue({ affected: 0, raw: [] });

      const result = await service.remove('non-existent');

      expect(result).toBe(false);
    });
  });

  describe('getCampaignStats', () => {
    it('should return correct statistics for a campaign', async () => {
      const mockCampaign = CampaignFixture.create({
        id: 'campaign-1',
        contentPieces: [
          ContentPieceFixture.create({ reviewState: ReviewState.DRAFT }),
          ContentPieceFixture.create({ reviewState: ReviewState.AI_SUGGESTED }),
          ContentPieceFixture.create({ reviewState: ReviewState.UNDER_REVIEW }),
          ContentPieceFixture.create({ reviewState: ReviewState.APPROVED }),
          ContentPieceFixture.create({ reviewState: ReviewState.REJECTED }),
          ContentPieceFixture.create({ reviewState: ReviewState.APPROVED }),
        ],
      });

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.getCampaignStats('campaign-1');

      expect(result).toEqual({
        totalContentPieces: 6,
        draftCount: 1,
        aiSuggestedCount: 1,
        underReviewCount: 1,
        approvedCount: 2,
        rejectedCount: 1,
      });
    });

    it('should return zero counts for campaign with no content pieces', async () => {
      const mockCampaign = CampaignFixture.create({
        id: 'campaign-1',
        contentPieces: [],
      });

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.getCampaignStats('campaign-1');

      expect(result).toEqual({
        totalContentPieces: 0,
        draftCount: 0,
        aiSuggestedCount: 0,
        underReviewCount: 0,
        approvedCount: 0,
        rejectedCount: 0,
      });
    });

    it('should throw NotFoundException when campaign not found', async () => {
      campaignsRepository.findOne.mockResolvedValue(null);

      await expect(service.getCampaignStats('non-existent')).rejects.toThrow(
        new NotFoundException('Campaign with ID non-existent not found'),
      );
    });

    it('should handle all review states correctly', async () => {
      const mockCampaign = CampaignFixture.create({
        id: 'campaign-1',
        contentPieces: [
          ContentPieceFixture.create({ reviewState: ReviewState.DRAFT }),
          ContentPieceFixture.create({ reviewState: ReviewState.AI_SUGGESTED }),
          ContentPieceFixture.create({ reviewState: ReviewState.UNDER_REVIEW }),
          ContentPieceFixture.create({ reviewState: ReviewState.APPROVED }),
          ContentPieceFixture.create({ reviewState: ReviewState.REJECTED }),
          ContentPieceFixture.create({ reviewState: ReviewState.NEEDS_REVISION }),
        ],
      });

      campaignsRepository.findOne.mockResolvedValue(mockCampaign);

      const result = await service.getCampaignStats('campaign-1');

      expect(result).toEqual({
        totalContentPieces: 6,
        draftCount: 1,
        aiSuggestedCount: 1,
        underReviewCount: 1,
        approvedCount: 1,
        rejectedCount: 1,
      });
    });
  });

  describe('error handling', () => {
    it('should handle database errors in findAll', async () => {
      const error = new Error('Database connection failed');
      campaignsRepository.find.mockRejectedValue(error);

      await expect(service.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should handle database errors in create', async () => {
      const createInput: CreateCampaignInput = {
        name: 'New Campaign',
      };

      const mockCampaign = CampaignFixture.create({ name: 'New Campaign' });
      campaignsRepository.create.mockReturnValue(mockCampaign);

      const error = new Error('Database save failed');
      campaignsRepository.save.mockRejectedValue(error);

      await expect(service.create(createInput)).rejects.toThrow('Database save failed');
    });

    it('should handle database errors in update', async () => {
      const existingCampaign = CampaignFixture.create({ id: 'campaign-1' });
      campaignsRepository.findOne.mockResolvedValue(existingCampaign);

      const error = new Error('Database save failed');
      campaignsRepository.save.mockRejectedValue(error);

      await expect(service.update('campaign-1', { name: 'New Name' })).rejects.toThrow(
        'Database save failed',
      );
    });

    it('should handle database errors in remove', async () => {
      const error = new Error('Database delete failed');
      campaignsRepository.delete.mockRejectedValue(error);

      await expect(service.remove('campaign-1')).rejects.toThrow('Database delete failed');
    });
  });
});
