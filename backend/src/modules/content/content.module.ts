import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContentPiece } from '../../entities/content-piece.entity';
import { ContentVersion } from '../../entities/content-version.entity';
import { Campaign } from '../../entities/campaign.entity';
import { ContentService } from './content.service';
import { ContentResolver } from './content.resolver';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([ContentPiece, ContentVersion, Campaign]), AiModule],
  providers: [ContentResolver, ContentService],
  exports: [ContentService],
})
export class ContentModule {}
