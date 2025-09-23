import { Test, TestingModule } from '@nestjs/testing';
import { CampaignsResolver } from './campaigns.resolver';
import { CampaignsService } from './campaigns.service';
import { CampaignStatus } from '../../entities/campaign.entity';
import { CampaignFixture } from '../../test/fixtures/campaign.fixture';

// Mock PubSub
jest.mock('graphql-subscriptions', () => ({
  PubSub: jest.fn().mockImplementation(() => ({
    publish: jest.fn(),
    asyncIterator: jest.fn().mockReturnValue({
      [Symbol.asyncIterator]: jest.fn(),
    }),
  })),
}));

describe('CampaignsResolver', () => {
  let resolver: CampaignsResolver;
  let campaignsService: jest.Mocked<CampaignsService>;

  beforeEach(async () => {
    const mockCampaignsService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      getCampaignStats: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CampaignsResolver,
        {
          provide: CampaignsService,
          useValue: mockCampaignsService,
        },
      ],
    }).compile();

    resolver = module.get<CampaignsResolver>(CampaignsResolver);
    campaignsService = module.get(CampaignsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('campaigns', () => {
    it('should return all campaigns', async () => {
      const mockCampaigns = [
        CampaignFixture.create({ id: 'campaign-1' }),
        CampaignFixture.create({ id: 'campaign-2' }),
      ];

      campaignsService.findAll.mockResolvedValue(mockCampaigns);

      const result = await resolver.findAll();

      expect(result).toEqual(mockCampaigns);
      expect(campaignsService.findAll).toHaveBeenCalled();
    });

    it('should return empty array when no campaigns exist', async () => {
      campaignsService.findAll.mockResolvedValue([]);

      const result = await resolver.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('campaign', () => {
    it('should return a specific campaign', async () => {
      const mockCampaign = CampaignFixture.create({ id: 'campaign-1' });
      campaignsService.findOne.mockResolvedValue(mockCampaign);

      const result = await resolver.findOne('campaign-1');

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.findOne).toHaveBeenCalledWith('campaign-1');
    });

    it('should throw error when campaign not found', async () => {
      campaignsService.findOne.mockRejectedValue(new Error('Campaign not found'));

      await expect(resolver.findOne('non-existent')).rejects.toThrow('Campaign not found');
    });
  });

  describe('campaignStats', () => {
    it('should return campaign statistics', async () => {
      const mockStats = {
        totalContentPieces: 5,
        draftCount: 2,
        aiSuggestedCount: 1,
        underReviewCount: 1,
        approvedCount: 1,
        rejectedCount: 0,
      };

      campaignsService.getCampaignStats.mockResolvedValue(mockStats);

      const result = await resolver.getCampaignStats('campaign-1');

      expect(result).toEqual(mockStats);
      expect(campaignsService.getCampaignStats).toHaveBeenCalledWith('campaign-1');
    });
  });

  describe('createCampaign', () => {
    it('should create a new campaign and publish event', async () => {
      const createInput = {
        name: 'New Campaign',
        description: 'Campaign description',
        targetLanguages: ['en', 'es'],
        targetMarkets: ['US', 'UK'],
      };

      const mockCampaign = CampaignFixture.create({
        name: 'New Campaign',
        description: 'Campaign description',
        targetLanguages: ['en', 'es'],
        targetMarkets: ['US', 'UK'],
      });

      campaignsService.create.mockResolvedValue(mockCampaign);

      const result = await resolver.createCampaign(createInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle creation errors', async () => {
      const createInput = {
        name: 'New Campaign',
      };

      campaignsService.create.mockRejectedValue(new Error('Creation failed'));

      await expect(resolver.createCampaign(createInput)).rejects.toThrow('Creation failed');
    });
  });

  describe('updateCampaign', () => {
    it('should update a campaign and publish event', async () => {
      const updateInput = {
        name: 'Updated Campaign',
        status: CampaignStatus.ACTIVE,
      };

      const mockCampaign = CampaignFixture.create({
        id: 'campaign-1',
        name: 'Updated Campaign',
        status: CampaignStatus.ACTIVE,
      });

      campaignsService.update.mockResolvedValue(mockCampaign);

      const result = await resolver.updateCampaign('campaign-1', updateInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.update).toHaveBeenCalledWith('campaign-1', updateInput);
    });

    it('should handle update errors', async () => {
      const updateInput = {
        name: 'Updated Campaign',
      };

      campaignsService.update.mockRejectedValue(new Error('Update failed'));

      await expect(resolver.updateCampaign('campaign-1', updateInput)).rejects.toThrow(
        'Update failed',
      );
    });
  });

  describe('removeCampaign', () => {
    it('should remove a campaign and publish event when successful', async () => {
      campaignsService.remove.mockResolvedValue(true);

      const result = await resolver.removeCampaign('campaign-1');

      expect(result).toBe(true);
      expect(campaignsService.remove).toHaveBeenCalledWith('campaign-1');
    });

    it('should return false when campaign not found', async () => {
      campaignsService.remove.mockResolvedValue(false);

      const result = await resolver.removeCampaign('non-existent');

      expect(result).toBe(false);
    });

    it('should handle removal errors', async () => {
      campaignsService.remove.mockRejectedValue(new Error('Removal failed'));

      await expect(resolver.removeCampaign('campaign-1')).rejects.toThrow('Removal failed');
    });
  });

  describe('subscriptions', () => {
    it('should return campaignCreated subscription iterator', () => {
      const iterator = resolver.campaignCreated();
      expect(iterator).toBeDefined();
    });

    it('should return campaignUpdated subscription iterator', () => {
      const iterator = resolver.campaignUpdated();
      expect(iterator).toBeDefined();
    });

    it('should return campaignDeleted subscription iterator', () => {
      const iterator = resolver.campaignDeleted();
      expect(iterator).toBeDefined();
    });
  });

  describe('input validation', () => {
    it('should handle CreateCampaignInputType with all fields', async () => {
      const createInput = {
        name: 'Test Campaign',
        description: 'Test description',
        targetLanguages: ['en', 'es', 'fr'],
        targetMarkets: ['US', 'UK', 'FR'],
      };

      const mockCampaign = CampaignFixture.create(createInput);
      campaignsService.create.mockResolvedValue(mockCampaign);

      const result = await resolver.createCampaign(createInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle CreateCampaignInputType with minimal fields', async () => {
      const createInput = {
        name: 'Test Campaign',
      };

      const mockCampaign = CampaignFixture.create(createInput);
      campaignsService.create.mockResolvedValue(mockCampaign);

      const result = await resolver.createCampaign(createInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.create).toHaveBeenCalledWith(createInput);
    });

    it('should handle UpdateCampaignInputType with all fields', async () => {
      const updateInput = {
        name: 'Updated Campaign',
        description: 'Updated description',
        status: CampaignStatus.ACTIVE,
        targetLanguages: ['en', 'es'],
        targetMarkets: ['US', 'UK'],
      };

      const mockCampaign = CampaignFixture.create(updateInput);
      campaignsService.update.mockResolvedValue(mockCampaign);

      const result = await resolver.updateCampaign('campaign-1', updateInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.update).toHaveBeenCalledWith('campaign-1', updateInput);
    });

    it('should handle UpdateCampaignInputType with partial fields', async () => {
      const updateInput = {
        status: CampaignStatus.COMPLETED,
      };

      const mockCampaign = CampaignFixture.create({
        id: 'campaign-1',
        status: CampaignStatus.COMPLETED,
      });
      campaignsService.update.mockResolvedValue(mockCampaign);

      const result = await resolver.updateCampaign('campaign-1', updateInput);

      expect(result).toEqual(mockCampaign);
      expect(campaignsService.update).toHaveBeenCalledWith('campaign-1', updateInput);
    });
  });

  describe('error handling', () => {
    it('should propagate service errors in findAll', async () => {
      const error = new Error('Database connection failed');
      campaignsService.findAll.mockRejectedValue(error);

      await expect(resolver.findAll()).rejects.toThrow('Database connection failed');
    });

    it('should propagate service errors in findOne', async () => {
      const error = new Error('Campaign not found');
      campaignsService.findOne.mockRejectedValue(error);

      await expect(resolver.findOne('campaign-1')).rejects.toThrow('Campaign not found');
    });

    it('should propagate service errors in getCampaignStats', async () => {
      const error = new Error('Stats calculation failed');
      campaignsService.getCampaignStats.mockRejectedValue(error);

      await expect(resolver.getCampaignStats('campaign-1')).rejects.toThrow(
        'Stats calculation failed',
      );
    });

    it('should propagate service errors in createCampaign', async () => {
      const error = new Error('Campaign creation failed');
      campaignsService.create.mockRejectedValue(error);

      await expect(resolver.createCampaign({ name: 'Test' })).rejects.toThrow(
        'Campaign creation failed',
      );
    });

    it('should propagate service errors in updateCampaign', async () => {
      const error = new Error('Campaign update failed');
      campaignsService.update.mockRejectedValue(error);

      await expect(resolver.updateCampaign('campaign-1', { name: 'Updated' })).rejects.toThrow(
        'Campaign update failed',
      );
    });

    it('should propagate service errors in removeCampaign', async () => {
      const error = new Error('Campaign removal failed');
      campaignsService.remove.mockRejectedValue(error);

      await expect(resolver.removeCampaign('campaign-1')).rejects.toThrow(
        'Campaign removal failed',
      );
    });
  });
});
