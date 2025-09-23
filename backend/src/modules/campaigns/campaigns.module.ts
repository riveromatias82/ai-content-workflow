import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { ContentPiece } from '../../entities/content-piece.entity';
import { CampaignsService } from './campaigns.service';
import { CampaignsResolver } from './campaigns.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Campaign, ContentPiece])],
  providers: [CampaignsResolver, CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
