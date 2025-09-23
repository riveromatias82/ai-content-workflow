import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { ContentPiece, ContentType, ReviewState } from '../../entities/content-piece.entity';
import { ContentVersion, AiProvider } from '../../entities/content-version.entity';
import {
  ContentService,
  CreateContentPieceInput,
  UpdateContentPieceInput,
} from './content.service';
import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';

const pubSub = new PubSub();

@InputType()
export class CreateContentPieceInputType implements CreateContentPieceInput {
  @Field()
  @IsString()
  campaignId: string;

  @Field()
  @IsString()
  title: string;

  @Field(() => ContentType)
  @IsEnum(ContentType)
  type: ContentType;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  briefing?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tone?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  sourceLanguage?: string;
}

@InputType()
export class UpdateContentPieceInputType implements UpdateContentPieceInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  title?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  briefing?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  tone?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  keywords?: string[];

  @Field(() => ReviewState, { nullable: true })
  @IsOptional()
  @IsEnum(ReviewState)
  reviewState?: ReviewState;
}

@InputType()
export class GenerateAiContentInputType {
  @Field()
  @IsString()
  contentPieceId: string;

  @Field(() => AiProvider, { nullable: true })
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider;
}

@InputType()
export class TranslateContentInputType {
  @Field()
  @IsString()
  contentVersionId: string;

  @Field()
  @IsString()
  targetLanguage: string;

  @Field(() => AiProvider, { nullable: true })
  @IsOptional()
  @IsEnum(AiProvider)
  provider?: AiProvider;
}

@InputType()
export class CreateManualVersionInputType {
  @Field()
  @IsString()
  contentPieceId: string;

  @Field()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  language?: string;
}

@InputType()
export class UpdateVersionInputType {
  @Field()
  @IsString()
  id: string;

  @Field()
  @IsString()
  content: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string;
}

@Resolver(() => ContentPiece)
export class ContentResolver {
  constructor(private readonly contentService: ContentService) {}

  @Query(() => [ContentPiece], { name: 'contentPieces' })
  async findAll(): Promise<ContentPiece[]> {
    return this.contentService.findAll();
  }

  @Query(() => ContentPiece, { name: 'contentPiece' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<ContentPiece> {
    return this.contentService.findOne(id);
  }

  @Query(() => [ContentPiece], { name: 'contentPiecesByCampaign' })
  async findByCampaign(
    @Args('campaignId', { type: () => ID }) campaignId: string,
  ): Promise<ContentPiece[]> {
    return this.contentService.findByCampaign(campaignId);
  }

  @Mutation(() => ContentPiece)
  async createContentPiece(
    @Args('createContentPieceInput') createContentPieceInput: CreateContentPieceInputType,
  ): Promise<ContentPiece> {
    const contentPiece = await this.contentService.create(createContentPieceInput);

    // Publish content piece creation event
    pubSub.publish('contentPieceCreated', { contentPieceCreated: contentPiece });

    return contentPiece;
  }

  @Mutation(() => ContentPiece)
  async updateContentPiece(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateContentPieceInput') updateContentPieceInput: UpdateContentPieceInputType,
  ): Promise<ContentPiece> {
    const contentPiece = await this.contentService.update(id, updateContentPieceInput);

    // Publish content piece update event
    pubSub.publish('contentPieceUpdated', { contentPieceUpdated: contentPiece });

    return contentPiece;
  }

  @Mutation(() => Boolean)
  async removeContentPiece(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const result = await this.contentService.remove(id);

    if (result) {
      // Publish content piece deletion event
      pubSub.publish('contentPieceDeleted', { contentPieceDeleted: { id } });
    }

    return result;
  }

  @Mutation(() => ContentVersion)
  async generateAiContent(
    @Args('generateAiContentInput') generateAiContentInput: GenerateAiContentInputType,
  ): Promise<ContentVersion> {
    const version = await this.contentService.generateAiContent(generateAiContentInput);

    // Publish AI content generation event
    pubSub.publish('aiContentGenerated', { aiContentGenerated: version });

    return version;
  }

  @Mutation(() => ContentVersion)
  async translateContent(
    @Args('translateContentInput') translateContentInput: TranslateContentInputType,
  ): Promise<ContentVersion> {
    const version = await this.contentService.translateContent(translateContentInput);

    // Publish content translation event
    pubSub.publish('contentTranslated', { contentTranslated: version });

    return version;
  }

  @Mutation(() => ContentVersion)
  async createManualVersion(
    @Args('createManualVersionInput') createManualVersionInput: CreateManualVersionInputType,
  ): Promise<ContentVersion> {
    const version = await this.contentService.createManualVersion(
      createManualVersionInput.contentPieceId,
      createManualVersionInput.content,
      createManualVersionInput.language,
    );

    // Publish manual version creation event
    pubSub.publish('manualVersionCreated', { manualVersionCreated: version });

    return version;
  }

  @Mutation(() => ContentVersion)
  async updateVersion(
    @Args('updateVersionInput') updateVersionInput: UpdateVersionInputType,
  ): Promise<ContentVersion> {
    const version = await this.contentService.updateVersion(
      updateVersionInput.id,
      updateVersionInput.content,
      updateVersionInput.reviewNotes,
    );

    // Publish version update event
    pubSub.publish('versionUpdated', { versionUpdated: version });

    return version;
  }

  @Mutation(() => ContentVersion)
  async setActiveVersion(@Args('id', { type: () => ID }) id: string): Promise<ContentVersion> {
    const version = await this.contentService.setActiveVersion(id);

    // Publish active version change event
    pubSub.publish('activeVersionChanged', { activeVersionChanged: version });

    return version;
  }

  // Subscriptions for real-time updates
  @Subscription(() => ContentPiece)
  contentPieceCreated() {
    return pubSub.asyncIterator('contentPieceCreated');
  }

  @Subscription(() => ContentPiece)
  contentPieceUpdated() {
    return pubSub.asyncIterator('contentPieceUpdated');
  }

  @Subscription(() => ContentVersion)
  aiContentGenerated() {
    return pubSub.asyncIterator('aiContentGenerated');
  }

  @Subscription(() => ContentVersion)
  contentTranslated() {
    return pubSub.asyncIterator('contentTranslated');
  }

  @Subscription(() => ContentVersion)
  versionUpdated() {
    return pubSub.asyncIterator('versionUpdated');
  }

  @Subscription(() => ContentVersion)
  activeVersionChanged() {
    return pubSub.asyncIterator('activeVersionChanged');
  }
}
