import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { ContentPiece } from '../../entities/content-piece.entity';

export interface CreateCampaignInput {
  name: string;
  description?: string;
  targetLanguages?: string[];
  targetMarkets?: string[];
}

export interface UpdateCampaignInput {
  name?: string;
  description?: string;
  status?: CampaignStatus;
  targetLanguages?: string[];
  targetMarkets?: string[];
}

@Injectable()
export class CampaignsService {
  constructor(
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    @InjectRepository(ContentPiece)
    private contentPiecesRepository: Repository<ContentPiece>,
  ) {}

  async findAll(): Promise<Campaign[]> {
    return this.campaignsRepository.find({
      relations: ['contentPieces', 'contentPieces.versions'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Campaign> {
    const campaign = await this.campaignsRepository.findOne({
      where: { id },
      relations: ['contentPieces', 'contentPieces.versions'],
    });

    if (!campaign) {
      throw new NotFoundException(`Campaign with ID ${id} not found`);
    }

    return campaign;
  }

  async create(createCampaignInput: CreateCampaignInput): Promise<Campaign> {
    const campaign = this.campaignsRepository.create({
      ...createCampaignInput,
      targetLanguages: createCampaignInput.targetLanguages || ['en'],
      targetMarkets: createCampaignInput.targetMarkets || [],
    });

    return this.campaignsRepository.save(campaign);
  }

  async update(id: string, updateCampaignInput: UpdateCampaignInput): Promise<Campaign> {
    const campaign = await this.findOne(id);

    Object.assign(campaign, updateCampaignInput);

    return this.campaignsRepository.save(campaign);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.campaignsRepository.delete(id);
    return result.affected > 0;
  }

  async getCampaignStats(id: string): Promise<{
    totalContentPieces: number;
    draftCount: number;
    aiSuggestedCount: number;
    underReviewCount: number;
    approvedCount: number;
    rejectedCount: number;
  }> {
    const campaign = await this.findOne(id);

    const stats = {
      totalContentPieces: campaign.contentPieces.length,
      draftCount: 0,
      aiSuggestedCount: 0,
      underReviewCount: 0,
      approvedCount: 0,
      rejectedCount: 0,
    };

    campaign.contentPieces.forEach((piece) => {
      switch (piece.reviewState) {
        case 'DRAFT':
          stats.draftCount++;
          break;
        case 'AI_SUGGESTED':
          stats.aiSuggestedCount++;
          break;
        case 'UNDER_REVIEW':
          stats.underReviewCount++;
          break;
        case 'APPROVED':
          stats.approvedCount++;
          break;
        case 'REJECTED':
          stats.rejectedCount++;
          break;
      }
    });

    return stats;
  }
}
