import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { ContentVersion } from './content-version.entity';

export enum ContentType {
  HEADLINE = 'HEADLINE',
  DESCRIPTION = 'DESCRIPTION',
  AD_COPY = 'AD_COPY',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  SOCIAL_POST = 'SOCIAL_POST',
  EMAIL_SUBJECT = 'EMAIL_SUBJECT',
  BLOG_TITLE = 'BLOG_TITLE',
}

export enum ReviewState {
  DRAFT = 'DRAFT',
  AI_SUGGESTED = 'AI_SUGGESTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}

registerEnumType(ContentType, {
  name: 'ContentType',
});

registerEnumType(ReviewState, {
  name: 'ReviewState',
});

@ObjectType()
@Entity('content_pieces')
export class ContentPiece {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  title: string;

  @Field(() => ContentType)
  @Column({
    type: 'enum',
    enum: ContentType,
  })
  type: ContentType;

  @Field(() => ReviewState)
  @Column({
    type: 'enum',
    enum: ReviewState,
    default: ReviewState.DRAFT,
  })
  reviewState: ReviewState;

  @Field()
  @Column({ default: 'en' })
  sourceLanguage: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  briefing?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  targetAudience?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  tone?: string;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  keywords: string[];

  @Field(() => Campaign)
  @ManyToOne(() => Campaign, (campaign) => campaign.contentPieces, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Field()
  @Column()
  campaignId: string;

  @Field(() => [ContentVersion])
  @OneToMany(() => ContentVersion, (version) => version.contentPiece, {
    cascade: true,
  })
  versions: ContentVersion[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
