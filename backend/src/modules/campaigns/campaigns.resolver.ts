import { Resolver, Query, Mutation, Args, ID, Subscription } from '@nestjs/graphql';
import { PubSub } from 'graphql-subscriptions';
import { Campaign, CampaignStatus } from '../../entities/campaign.entity';
import { CampaignsService, CreateCampaignInput, UpdateCampaignInput } from './campaigns.service';
import { InputType, Field, ObjectType } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray } from 'class-validator';

const pubSub = new PubSub();

@InputType()
export class CreateCampaignInputType implements CreateCampaignInput {
  @Field()
  @IsString()
  name: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLanguages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetMarkets?: string[];
}

@InputType()
export class UpdateCampaignInputType implements UpdateCampaignInput {
  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description?: string;

  @Field(() => CampaignStatus, { nullable: true })
  @IsOptional()
  status?: CampaignStatus;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetLanguages?: string[];

  @Field(() => [String], { nullable: true })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetMarkets?: string[];
}

@ObjectType()
export class CampaignStats {
  @Field()
  totalContentPieces: number;

  @Field()
  draftCount: number;

  @Field()
  aiSuggestedCount: number;

  @Field()
  underReviewCount: number;

  @Field()
  approvedCount: number;

  @Field()
  rejectedCount: number;
}

@Resolver(() => Campaign)
export class CampaignsResolver {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Query(() => [Campaign], { name: 'campaigns' })
  async findAll(): Promise<Campaign[]> {
    return this.campaignsService.findAll();
  }

  @Query(() => Campaign, { name: 'campaign' })
  async findOne(@Args('id', { type: () => ID }) id: string): Promise<Campaign> {
    return this.campaignsService.findOne(id);
  }

  @Query(() => CampaignStats, { name: 'campaignStats' })
  async getCampaignStats(@Args('id', { type: () => ID }) id: string): Promise<CampaignStats> {
    return this.campaignsService.getCampaignStats(id);
  }

  @Mutation(() => Campaign)
  async createCampaign(
    @Args('createCampaignInput') createCampaignInput: CreateCampaignInputType,
  ): Promise<Campaign> {
    const campaign = await this.campaignsService.create(createCampaignInput);

    // Publish campaign creation event
    pubSub.publish('campaignCreated', { campaignCreated: campaign });

    return campaign;
  }

  @Mutation(() => Campaign)
  async updateCampaign(
    @Args('id', { type: () => ID }) id: string,
    @Args('updateCampaignInput') updateCampaignInput: UpdateCampaignInputType,
  ): Promise<Campaign> {
    const campaign = await this.campaignsService.update(id, updateCampaignInput);

    // Publish campaign update event
    pubSub.publish('campaignUpdated', { campaignUpdated: campaign });

    return campaign;
  }

  @Mutation(() => Boolean)
  async removeCampaign(@Args('id', { type: () => ID }) id: string): Promise<boolean> {
    const result = await this.campaignsService.remove(id);

    if (result) {
      // Publish campaign deletion event
      pubSub.publish('campaignDeleted', { campaignDeleted: { id } });
    }

    return result;
  }

  @Subscription(() => Campaign)
  campaignCreated() {
    return pubSub.asyncIterator('campaignCreated');
  }

  @Subscription(() => Campaign)
  campaignUpdated() {
    return pubSub.asyncIterator('campaignUpdated');
  }

  @Subscription(() => ID)
  campaignDeleted() {
    return pubSub.asyncIterator('campaignDeleted');
  }
}
