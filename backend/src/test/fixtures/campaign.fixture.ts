import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { ContentPiece, ContentType, ReviewState } from '../../entities/content-piece.entity';
import { ContentVersion, VersionType, AiProvider } from '../../entities/content-version.entity';

export class CampaignFixture {
  static create(overrides: Partial<Campaign> = {}): Campaign {
    const campaign = new Campaign();
    campaign.id = overrides.id || 'campaign-123';
    campaign.name = overrides.name || 'Test Campaign';
    campaign.description = overrides.description || 'Test campaign description';
    campaign.status = overrides.status || CampaignStatus.DRAFT;
    campaign.targetLanguages = overrides.targetLanguages || ['en', 'es'];
    campaign.targetMarkets = overrides.targetMarkets || ['US', 'UK'];
    campaign.contentPieces = overrides.contentPieces || [];
    campaign.createdAt = overrides.createdAt || new Date('2024-01-01');
    campaign.updatedAt = overrides.updatedAt || new Date('2024-01-01');
    return campaign;
  }

  static createWithContentPieces(overrides: Partial<Campaign> = {}): Campaign {
    const campaign = this.create(overrides);
    campaign.contentPieces = [
      ContentPieceFixture.create({ campaignId: campaign.id }),
      ContentPieceFixture.create({
        campaignId: campaign.id,
        reviewState: ReviewState.APPROVED,
      }),
    ];
    return campaign;
  }
}

export class ContentPieceFixture {
  static create(overrides: Partial<ContentPiece> = {}): ContentPiece {
    const contentPiece = new ContentPiece();
    contentPiece.id = overrides.id || 'content-piece-123';
    contentPiece.title = overrides.title || 'Test Content Piece';
    contentPiece.type = overrides.type || ContentType.HEADLINE;
    contentPiece.reviewState = overrides.reviewState || ReviewState.DRAFT;
    contentPiece.sourceLanguage = overrides.sourceLanguage || 'en';
    contentPiece.briefing = overrides.briefing || 'Test briefing';
    contentPiece.targetAudience = overrides.targetAudience || 'General audience';
    contentPiece.tone = overrides.tone || 'Professional';
    contentPiece.keywords = overrides.keywords || ['test', 'content'];
    contentPiece.campaignId = overrides.campaignId || 'campaign-123';
    contentPiece.versions = overrides.versions || [];
    contentPiece.createdAt = overrides.createdAt || new Date('2024-01-01');
    contentPiece.updatedAt = overrides.updatedAt || new Date('2024-01-01');
    return contentPiece;
  }

  static createWithVersions(overrides: Partial<ContentPiece> = {}): ContentPiece {
    const contentPiece = this.create(overrides);
    contentPiece.versions = [
      ContentVersionFixture.create({ contentPieceId: contentPiece.id }),
      ContentVersionFixture.create({
        contentPieceId: contentPiece.id,
        type: VersionType.AI_GENERATED,
      }),
    ];
    return contentPiece;
  }
}

export class ContentVersionFixture {
  static create(overrides: Partial<ContentVersion> = {}): ContentVersion {
    const version = new ContentVersion();
    version.id = overrides.id || 'version-123';
    version.content = overrides.content || 'Test content';
    version.language = overrides.language || 'en';
    version.type = overrides.type || VersionType.ORIGINAL;
    version.aiProvider = overrides.aiProvider || AiProvider.OPENAI;
    version.aiModel = overrides.aiModel || 'gpt-4';
    version.aiMetadata = overrides.aiMetadata || { model: 'gpt-4', provider: 'openai' };
    version.sentimentAnalysis = overrides.sentimentAnalysis || {
      sentiment: 'positive',
      confidence: 0.8,
      keywords: ['test'],
    };
    version.version = overrides.version || 1;
    version.isActive = overrides.isActive || true;
    version.reviewNotes = overrides.reviewNotes || 'Test notes';
    version.contentPieceId = overrides.contentPieceId || 'content-piece-123';
    version.contentPiece = overrides.contentPiece;
    version.createdAt = overrides.createdAt || new Date('2024-01-01');
    version.updatedAt = overrides.updatedAt || new Date('2024-01-01');
    return version;
  }
}
