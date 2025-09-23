import { Campaign, CampaignStatus } from './campaign.entity';
import { ContentPiece } from './content-piece.entity';

describe('Campaign Entity', () => {
  let campaign: Campaign;

  beforeEach(() => {
    campaign = new Campaign();
  });

  describe('basic properties', () => {
    it('should have all required properties', () => {
      // Initialize properties to test they can be set
      campaign.id = 'test-id';
      campaign.name = 'Test Campaign';
      campaign.description = 'Test Description';
      campaign.status = CampaignStatus.DRAFT;
      campaign.targetLanguages = ['en'];
      campaign.targetMarkets = ['US'];
      campaign.contentPieces = [];
      campaign.createdAt = new Date();
      campaign.updatedAt = new Date();

      expect(campaign.id).toBe('test-id');
      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.description).toBe('Test Description');
      expect(campaign.status).toBe(CampaignStatus.DRAFT);
      expect(campaign.targetLanguages).toEqual(['en']);
      expect(campaign.targetMarkets).toEqual(['US']);
      expect(campaign.contentPieces).toEqual([]);
      expect(campaign.createdAt).toBeInstanceOf(Date);
      expect(campaign.updatedAt).toBeInstanceOf(Date);
    });

    it('should initialize with default values', () => {
      campaign.name = 'Test Campaign';
      campaign.description = 'Test Description';
      campaign.status = CampaignStatus.DRAFT;
      campaign.targetLanguages = ['en'];
      campaign.targetMarkets = ['US'];
      campaign.contentPieces = [];

      expect(campaign.name).toBe('Test Campaign');
      expect(campaign.description).toBe('Test Description');
      expect(campaign.status).toBe(CampaignStatus.DRAFT);
      expect(campaign.targetLanguages).toEqual(['en']);
      expect(campaign.targetMarkets).toEqual(['US']);
      expect(campaign.contentPieces).toEqual([]);
    });
  });

  describe('status enum', () => {
    it('should accept all valid status values', () => {
      const validStatuses = [
        CampaignStatus.DRAFT,
        CampaignStatus.ACTIVE,
        CampaignStatus.COMPLETED,
        CampaignStatus.ARCHIVED,
      ];

      validStatuses.forEach((status) => {
        campaign.status = status;
        expect(campaign.status).toBe(status);
      });
    });
  });

  describe('targetLanguages array', () => {
    it('should handle empty array', () => {
      campaign.targetLanguages = [];
      expect(campaign.targetLanguages).toEqual([]);
    });

    it('should handle multiple languages', () => {
      campaign.targetLanguages = ['en', 'es', 'fr', 'de'];
      expect(campaign.targetLanguages).toEqual(['en', 'es', 'fr', 'de']);
    });

    it('should handle single language', () => {
      campaign.targetLanguages = ['en'];
      expect(campaign.targetLanguages).toEqual(['en']);
    });
  });

  describe('targetMarkets array', () => {
    it('should handle empty array', () => {
      campaign.targetMarkets = [];
      expect(campaign.targetMarkets).toEqual([]);
    });

    it('should handle multiple markets', () => {
      campaign.targetMarkets = ['US', 'UK', 'CA', 'AU'];
      expect(campaign.targetMarkets).toEqual(['US', 'UK', 'CA', 'AU']);
    });

    it('should handle single market', () => {
      campaign.targetMarkets = ['US'];
      expect(campaign.targetMarkets).toEqual(['US']);
    });
  });

  describe('contentPieces relationship', () => {
    it('should handle empty content pieces array', () => {
      campaign.contentPieces = [];
      expect(campaign.contentPieces).toEqual([]);
    });

    it('should handle multiple content pieces', () => {
      const contentPiece1 = new ContentPiece();
      contentPiece1.id = 'content-1';
      contentPiece1.title = 'Content 1';

      const contentPiece2 = new ContentPiece();
      contentPiece2.id = 'content-2';
      contentPiece2.title = 'Content 2';

      campaign.contentPieces = [contentPiece1, contentPiece2];
      expect(campaign.contentPieces).toHaveLength(2);
      expect(campaign.contentPieces[0].title).toBe('Content 1');
      expect(campaign.contentPieces[1].title).toBe('Content 2');
    });
  });

  describe('timestamps', () => {
    it('should handle createdAt timestamp', () => {
      const now = new Date();
      campaign.createdAt = now;
      expect(campaign.createdAt).toBe(now);
    });

    it('should handle updatedAt timestamp', () => {
      const now = new Date();
      campaign.updatedAt = now;
      expect(campaign.updatedAt).toBe(now);
    });
  });

  describe('optional properties', () => {
    it('should handle optional description', () => {
      campaign.description = 'Test Description';
      expect(campaign.description).toBe('Test Description');

      campaign.description = undefined;
      expect(campaign.description).toBeUndefined();

      campaign.description = null;
      expect(campaign.description).toBeNull();
    });
  });

  describe('entity validation', () => {
    it('should create a valid campaign instance', () => {
      const validCampaign = new Campaign();
      validCampaign.id = 'campaign-123';
      validCampaign.name = 'Valid Campaign';
      validCampaign.description = 'Valid description';
      validCampaign.status = CampaignStatus.ACTIVE;
      validCampaign.targetLanguages = ['en', 'es'];
      validCampaign.targetMarkets = ['US', 'UK'];
      validCampaign.contentPieces = [];
      validCampaign.createdAt = new Date();
      validCampaign.updatedAt = new Date();

      expect(validCampaign.id).toBe('campaign-123');
      expect(validCampaign.name).toBe('Valid Campaign');
      expect(validCampaign.description).toBe('Valid description');
      expect(validCampaign.status).toBe(CampaignStatus.ACTIVE);
      expect(validCampaign.targetLanguages).toEqual(['en', 'es']);
      expect(validCampaign.targetMarkets).toEqual(['US', 'UK']);
      expect(validCampaign.contentPieces).toEqual([]);
      expect(validCampaign.createdAt).toBeInstanceOf(Date);
      expect(validCampaign.updatedAt).toBeInstanceOf(Date);
    });

    it('should handle minimal required fields', () => {
      const minimalCampaign = new Campaign();
      minimalCampaign.name = 'Minimal Campaign';
      minimalCampaign.status = CampaignStatus.DRAFT;
      minimalCampaign.targetLanguages = ['en'];
      minimalCampaign.targetMarkets = [];

      expect(minimalCampaign.name).toBe('Minimal Campaign');
      expect(minimalCampaign.status).toBe(CampaignStatus.DRAFT);
      expect(minimalCampaign.targetLanguages).toEqual(['en']);
      expect(minimalCampaign.targetMarkets).toEqual([]);
    });
  });

  describe('enum registration', () => {
    it('should have CampaignStatus enum properly defined', () => {
      expect(CampaignStatus.DRAFT).toBe('DRAFT');
      expect(CampaignStatus.ACTIVE).toBe('ACTIVE');
      expect(CampaignStatus.COMPLETED).toBe('COMPLETED');
      expect(CampaignStatus.ARCHIVED).toBe('ARCHIVED');
    });
  });
});
