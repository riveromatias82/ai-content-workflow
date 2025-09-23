import { Repository } from 'typeorm';
import { Campaign } from '../../entities/campaign.entity';
import { ContentPiece } from '../../entities/content-piece.entity';
import { ContentVersion } from '../../entities/content-version.entity';

export class MockRepository<T> implements Partial<Repository<T>> {
  find = jest.fn();
  findOne = jest.fn();
  findOneBy = jest.fn();
  create = jest.fn();
  save = jest.fn();
  update = jest.fn();
  delete = jest.fn();
  count = jest.fn();

  // Helper methods for test setup
  mockFindSuccess(data: T[] = []) {
    this.find.mockResolvedValue(data);
  }

  mockFindOneSuccess(data: T | null = null) {
    this.findOne.mockResolvedValue(data);
  }

  mockFindOneBySuccess(data: T | null = null) {
    this.findOneBy.mockResolvedValue(data);
  }

  mockCreateSuccess(data: T) {
    this.create.mockReturnValue(data);
  }

  mockSaveSuccess(data: T) {
    this.save.mockResolvedValue(data);
  }

  mockUpdateSuccess(affected: number = 1) {
    this.update.mockResolvedValue({ affected, generatedMaps: [], raw: [] });
  }

  mockDeleteSuccess(affected: number = 1) {
    this.delete.mockResolvedValue({ affected, raw: [] });
  }

  mockCountSuccess(count: number = 0) {
    this.count.mockResolvedValue(count);
  }

  // Error mocking
  mockError(error: Error = new Error('Database error')) {
    this.find.mockRejectedValue(error);
    this.findOne.mockRejectedValue(error);
    this.findOneBy.mockRejectedValue(error);
    this.create.mockImplementation(() => {
      throw error;
    });
    this.save.mockRejectedValue(error);
    this.update.mockRejectedValue(error);
    this.delete.mockRejectedValue(error);
    this.count.mockRejectedValue(error);
  }

  // Reset all mocks
  reset() {
    this.find.mockReset();
    this.findOne.mockReset();
    this.findOneBy.mockReset();
    this.create.mockReset();
    this.save.mockReset();
    this.update.mockReset();
    this.delete.mockReset();
    this.count.mockReset();
  }
}

export const createMockCampaignRepository = (): MockRepository<Campaign> => {
  return new MockRepository<Campaign>();
};

export const createMockContentPieceRepository = (): MockRepository<ContentPiece> => {
  return new MockRepository<ContentPiece>();
};

export const createMockContentVersionRepository = (): MockRepository<ContentVersion> => {
  return new MockRepository<ContentVersion>();
};
