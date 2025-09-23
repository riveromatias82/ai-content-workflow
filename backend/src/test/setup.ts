// Global test setup file
import 'reflect-metadata';

// Mock console methods to reduce noise in tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Suppress console.error and console.warn in tests unless explicitly needed
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  // Restore original console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Global test utilities
global.testUtils = {
  // Helper to create mock dates
  createMockDate: (dateString: string) => new Date(dateString),

  // Helper to wait for async operations
  waitFor: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),

  // Helper to create mock UUIDs
  createMockUuid: async (uuid: string) => {
    const crypto = await import('crypto');
    const originalRandomUUID = crypto.randomUUID;
    crypto.randomUUID = jest.fn(() => uuid as `${string}-${string}-${string}-${string}-${string}`);
    return () => {
      crypto.randomUUID = originalRandomUUID;
    };
  },
};

// Extend Jest matchers if needed
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeValidDate(): R;
    }
  }
}

// Custom Jest matchers
expect.extend({
  toBeValidDate(received: unknown) {
    const pass = received instanceof Date && !isNaN(received.getTime());
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid date`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid date`,
        pass: false,
      };
    }
  },
});
