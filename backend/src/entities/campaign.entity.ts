import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { ContentPiece } from './content-piece.entity';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  ARCHIVED = 'ARCHIVED',
}

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
});

@ObjectType()
@Entity('campaigns')
export class Campaign {
  @Field(() => ID)
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Field()
  @Column()
  name: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  description?: string;

  @Field(() => CampaignStatus)
  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  targetLanguages: string[];

  @Field(() => [String])
  @Column('text', { array: true, default: [] })
  targetMarkets: string[];

  @Field(() => [ContentPiece])
  @OneToMany(() => ContentPiece, (contentPiece) => contentPiece.campaign, {
    cascade: true,
  })
  contentPieces: ContentPiece[];

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
