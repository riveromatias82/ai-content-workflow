import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ContentPiece, ContentType, ReviewState } from '../../entities/content-piece.entity';
import { ContentVersion, VersionType, AiProvider } from '../../entities/content-version.entity';
import { Campaign } from '../../entities/campaign.entity';
import { AiService, GenerateContentRequest, TranslateContentRequest } from '../ai/ai.service';

export interface CreateContentPieceInput {
  campaignId: string;
  title: string;
  type: ContentType;
  briefing?: string;
  targetAudience?: string;
  tone?: string;
  keywords?: string[];
  sourceLanguage?: string;
}

export interface UpdateContentPieceInput {
  title?: string;
  briefing?: string;
  targetAudience?: string;
  tone?: string;
  keywords?: string[];
  reviewState?: ReviewState;
}

export interface GenerateAiContentInput {
  contentPieceId: string;
  provider?: AiProvider;
}

export interface TranslateContentInput {
  contentVersionId: string;
  targetLanguage: string;
  provider?: AiProvider;
}

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(ContentPiece)
    private contentPiecesRepository: Repository<ContentPiece>,
    @InjectRepository(ContentVersion)
    private contentVersionsRepository: Repository<ContentVersion>,
    @InjectRepository(Campaign)
    private campaignsRepository: Repository<Campaign>,
    private aiService: AiService,
  ) {}

  async findAll(): Promise<ContentPiece[]> {
    return this.contentPiecesRepository.find({
      relations: ['campaign', 'versions'],
      order: { updatedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<ContentPiece> {
    const contentPiece = await this.contentPiecesRepository.findOne({
      where: { id },
      relations: ['campaign', 'versions'],
    });

    if (!contentPiece) {
      throw new NotFoundException(`Content piece with ID ${id} not found`);
    }

    return contentPiece;
  }

  async findByCampaign(campaignId: string): Promise<ContentPiece[]> {
    return this.contentPiecesRepository.find({
      where: { campaignId },
      relations: ['campaign', 'versions'],
      order: { updatedAt: 'DESC' },
    });
  }

  async create(createContentPieceInput: CreateContentPieceInput): Promise<ContentPiece> {
    // Validate that the campaign exists
    const campaign = await this.campaignsRepository.findOne({
      where: { id: createContentPieceInput.campaignId },
    });

    if (!campaign) {
      throw new BadRequestException(
        `Campaign with ID ${createContentPieceInput.campaignId} not found`,
      );
    }

    const contentPiece = this.contentPiecesRepository.create({
      ...createContentPieceInput,
      sourceLanguage: createContentPieceInput.sourceLanguage || 'en',
      keywords: createContentPieceInput.keywords || [],
    });

    const savedContentPiece = await this.contentPiecesRepository.save(contentPiece);

    // Fetch the created content piece with campaign relationship to satisfy GraphQL schema
    return this.contentPiecesRepository.findOne({
      where: { id: savedContentPiece.id },
      relations: ['campaign', 'versions'],
    });
  }

  async update(
    id: string,
    updateContentPieceInput: UpdateContentPieceInput,
  ): Promise<ContentPiece> {
    const contentPiece = await this.findOne(id);

    Object.assign(contentPiece, updateContentPieceInput);

    return this.contentPiecesRepository.save(contentPiece);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.contentPiecesRepository.delete(id);
    return result.affected > 0;
  }

  async generateAiContent(input: GenerateAiContentInput): Promise<ContentVersion> {
    const contentPiece = await this.findOne(input.contentPieceId);

    const generateRequest: GenerateContentRequest = {
      type: contentPiece.type,
      briefing: contentPiece.briefing || '',
      targetAudience: contentPiece.targetAudience,
      tone: contentPiece.tone,
      keywords: contentPiece.keywords,
      language: contentPiece.sourceLanguage,
      provider: input.provider,
    };

    const result = await this.aiService.generateContent(generateRequest);

    // Analyze the generated content
    const analysis = await this.aiService.analyzeContent(result.content);

    // Create new version
    const version = this.contentVersionsRepository.create({
      contentPieceId: contentPiece.id,
      content: result.content,
      language: contentPiece.sourceLanguage,
      type: VersionType.AI_GENERATED,
      aiProvider: input.provider || AiProvider.OPENAI,
      aiModel: result.metadata.model,
      aiMetadata: result.metadata,
      sentimentAnalysis: analysis,
      version: await this.getNextVersionNumber(contentPiece.id),
      isActive: false,
    } as Partial<ContentVersion>);

    const savedVersion = await this.contentVersionsRepository.save(version);

    // Update content piece state
    await this.update(contentPiece.id, {
      reviewState: ReviewState.AI_SUGGESTED,
    });

    // Load the saved version with contentPiece relation for GraphQL response
    return this.contentVersionsRepository.findOne({
      where: { id: (savedVersion as ContentVersion).id },
      relations: ['contentPiece'],
    });
  }

  async translateContent(input: TranslateContentInput): Promise<ContentVersion> {
    const sourceVersion = await this.contentVersionsRepository.findOne({
      where: { id: input.contentVersionId },
      relations: ['contentPiece'],
    });

    if (!sourceVersion) {
      throw new NotFoundException(`Content version with ID ${input.contentVersionId} not found`);
    }

    const translateRequest: TranslateContentRequest = {
      content: sourceVersion.content,
      sourceLanguage: sourceVersion.language,
      targetLanguage: input.targetLanguage,
      context: sourceVersion.contentPiece.briefing,
      provider: input.provider,
    };

    const result = await this.aiService.translateContent(translateRequest);

    // Analyze the translated content
    const analysis = await this.aiService.analyzeContent(result.content);

    // Create translated version
    const translatedVersion = this.contentVersionsRepository.create({
      contentPieceId: sourceVersion.contentPieceId,
      content: result.content,
      language: input.targetLanguage,
      type: VersionType.AI_TRANSLATED,
      aiProvider: input.provider || AiProvider.OPENAI,
      aiModel: result.metadata.model,
      aiMetadata: result.metadata,
      sentimentAnalysis: analysis,
      version: await this.getNextVersionNumber(sourceVersion.contentPieceId),
      isActive: false,
    } as Partial<ContentVersion>);

    const savedTranslatedVersion = await this.contentVersionsRepository.save(translatedVersion);

    // Load the saved version with contentPiece relation for GraphQL response
    return this.contentVersionsRepository.findOne({
      where: { id: (savedTranslatedVersion as ContentVersion).id },
      relations: ['contentPiece'],
    });
  }

  async createManualVersion(
    contentPieceId: string,
    content: string,
    language: string = 'en',
  ): Promise<ContentVersion> {
    const version = this.contentVersionsRepository.create({
      contentPieceId,
      content,
      language,
      type: VersionType.ORIGINAL,
      version: await this.getNextVersionNumber(contentPieceId),
      isActive: true,
    });

    const savedVersion = await this.contentVersionsRepository.save(version);

    // Load the saved version with contentPiece relation for GraphQL response
    return this.contentVersionsRepository.findOne({
      where: { id: savedVersion.id },
      relations: ['contentPiece'],
    });
  }

  async updateVersion(id: string, content: string, reviewNotes?: string): Promise<ContentVersion> {
    const version = await this.contentVersionsRepository.findOne({
      where: { id },
    });

    if (!version) {
      throw new NotFoundException(`Content version with ID ${id} not found`);
    }

    version.content = content;
    version.type = VersionType.HUMAN_EDITED;
    if (reviewNotes) {
      version.reviewNotes = reviewNotes;
    }

    const savedVersion = await this.contentVersionsRepository.save(version);

    // Load the saved version with contentPiece relation for GraphQL response
    return this.contentVersionsRepository.findOne({
      where: { id: savedVersion.id },
      relations: ['contentPiece'],
    });
  }

  async setActiveVersion(id: string): Promise<ContentVersion> {
    const version = await this.contentVersionsRepository.findOne({
      where: { id },
    });

    if (!version) {
      throw new NotFoundException(`Content version with ID ${id} not found`);
    }

    // Deactivate all other versions for this content piece
    await this.contentVersionsRepository.update(
      { contentPieceId: version.contentPieceId },
      { isActive: false },
    );

    // Activate this version
    version.isActive = true;
    const savedVersion = await this.contentVersionsRepository.save(version);

    // Load the saved version with contentPiece relation for GraphQL response
    return this.contentVersionsRepository.findOne({
      where: { id: savedVersion.id },
      relations: ['contentPiece'],
    });
  }

  private async getNextVersionNumber(contentPieceId: string): Promise<number> {
    const lastVersion = await this.contentVersionsRepository.findOne({
      where: { contentPieceId },
      order: { version: 'DESC' },
    });

    return lastVersion ? lastVersion.version + 1 : 1;
  }
}
