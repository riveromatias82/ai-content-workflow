import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { ContentPiece } from '../../entities/content-piece.entity';
import { ContentVersion } from '../../entities/content-version.entity';
import { AiService } from '../../modules/ai/ai.service';
import {
  createMockCampaignRepository,
  createMockContentPieceRepository,
  createMockContentVersionRepository,
} from '../mocks/database.mock';
import { createMockAiService } from '../mocks/ai-service.mock';

export interface TestModuleOptions {
  includeAiService?: boolean;
  includeRepositories?: boolean;
}

export class TestHelpers {
  static async createTestingModule(
    moduleClass: any,
    options: TestModuleOptions = {},
  ): Promise<TestingModule> {
    const moduleBuilder = Test.createTestingModule({
      providers: [moduleClass],
    });

    if (options.includeRepositories !== false) {
      moduleBuilder
        .overrideProvider(getRepositoryToken(Campaign))
        .useValue(createMockCampaignRepository())
        .overrideProvider(getRepositoryToken(ContentPiece))
        .useValue(createMockContentPieceRepository())
        .overrideProvider(getRepositoryToken(ContentVersion))
        .useValue(createMockContentVersionRepository());
    }

    if (options.includeAiService) {
      moduleBuilder.overrideProvider(AiService).useValue(createMockAiService());
    }

    return moduleBuilder.compile();
  }

  static createMockContext() {
    return {
      req: {
        user: {
          id: 'user-123',
          email: 'test@example.com',
        },
      },
    };
  }

  static createMockPubSub() {
    return {
      publish: jest.fn(),
      asyncIterator: jest.fn().mockReturnValue({
        [Symbol.asyncIterator]: jest.fn(),
      }),
    };
  }

  static expectGraphQLResponse(response: { body: { data: unknown } }, expectedData: unknown) {
    expect(response.body.data).toEqual(expectedData);
  }

  static expectGraphQLError(
    response: { body: { errors: Array<{ message: string }> } },
    expectedError?: string,
  ) {
    expect(response.body.errors).toBeDefined();
    if (expectedError) {
      expect(response.body.errors[0].message).toContain(expectedError);
    }
  }

  static createMockRequest(body: unknown = {}) {
    return {
      body,
      headers: {},
      query: {},
      params: {},
    };
  }

  static createMockResponse() {
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    return res;
  }

  static async waitForAsync(ms: number = 0) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static mockDate(date: Date) {
    const originalDate = Date;
    global.Date = jest.fn(() => date) as unknown as typeof Date;
    global.Date.UTC = originalDate.UTC;
    global.Date.parse = originalDate.parse;
    global.Date.now = jest.fn(() => date.getTime());
  }

  static restoreDate() {
    global.Date = Date;
  }
}

export const mockUuid = async (uuid: string) => {
  const crypto = await import('crypto');
  const originalRandomUUID = crypto.randomUUID;
  crypto.randomUUID = jest.fn(() => uuid as `${string}-${string}-${string}-${string}-${string}`);
  return () => {
    crypto.randomUUID = originalRandomUUID;
  };
};
