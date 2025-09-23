import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { GraphQLJSONObject } from 'graphql-scalars';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContentPiece } from './content-piece.entity';

export enum VersionType {
  ORIGINAL = 'ORIGINAL',
  AI_GENERATED = 'AI_GENERATED',
  AI_TRANSLATED = 'AI_TRANSLATED',
  HUMAN_EDITED = 'HUMAN_EDITED',
}

export enum AiProvider {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  LANGCHAIN = 'LANGCHAIN',
}

registerEnumType(VersionType, {
  name: 'VersionType',
});

registerEnumType(AiProvider, {
  name: 'AiProvider',
});

@ObjectType()
@Entity('content_versions')
export class ContentVersion {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column('text')
  content: string;

  @Field()
  @Column({ default: 'en' })
  language: string;

  @Field(() => VersionType)
  @Column({
    type: 'enum',
    enum: VersionType,
    default: VersionType.ORIGINAL,
  })
  type: VersionType;

  @Field(() => AiProvider, { nullable: true })
  @Column({
    type: 'enum',
    enum: AiProvider,
    nullable: true,
  })
  aiProvider?: AiProvider;

  @Field({ nullable: true })
  @Column({ nullable: true })
  aiModel?: string;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column('jsonb', { nullable: true })
  aiMetadata?: Record<string, unknown>;

  @Field(() => GraphQLJSONObject, { nullable: true })
  @Column('jsonb', { nullable: true })
  sentimentAnalysis?: {
    sentiment: string;
    confidence: number;
    keywords: string[];
  };

  @Field()
  @Column({ default: 1 })
  version: number;

  @Field()
  @Column({ default: false })
  isActive: boolean;

  @Field({ nullable: true })
  @Column({ nullable: true })
  reviewNotes?: string;

  @Field(() => ContentPiece)
  @ManyToOne(() => ContentPiece, (contentPiece) => contentPiece.versions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'contentPieceId' })
  contentPiece: ContentPiece;

  @Field()
  @Column()
  contentPieceId: string;

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
