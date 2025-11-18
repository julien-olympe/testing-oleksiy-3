import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';

// Mock Prisma Client before importing health routes
const mockQueryRaw = jest.fn();
jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => ({
      $queryRaw: mockQueryRaw,
    })),
  };
});

// Import after mocking
import { healthRoutes } from '../../src/backend/routes/health.routes';

describe('Health Check', () => {
  let fastify: FastifyInstance;

  beforeAll(async () => {
    // Create Fastify instance for testing
    const fastifyModule = await import('fastify');
    fastify = fastifyModule.default({
      logger: false,
    });

    // Register health routes
    await fastify.register(healthRoutes);
    await fastify.ready();
  });

  afterAll(async () => {
    await fastify.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Framework Health Check', () => {
    test('should pass basic framework test', () => {
      expect(true).toBe(true);
    });
  });

  describe('Health Check Endpoint', () => {
    test('should return healthy status from health endpoint', async () => {
      // Mock successful database query
      mockQueryRaw.mockResolvedValue([{ result: 1 }]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        status: 'healthy',
        database: 'connected',
      });
      expect(body.timestamp).toBeDefined();
      expect(typeof body.timestamp).toBe('string');
    });

    test('should verify database connection in health check', async () => {
      mockQueryRaw.mockResolvedValue([{ result: 1 }]);

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(mockQueryRaw).toHaveBeenCalled();
      expect(response.statusCode).toBe(200);
      const body = JSON.parse(response.body);
      expect(body.database).toBe('connected');
    });

    test('should handle database connection failure in health check', async () => {
      // Mock database connection failure
      mockQueryRaw.mockRejectedValue(new Error('Connection failed'));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/health',
      });

      expect(mockQueryRaw).toHaveBeenCalled();
      expect(response.statusCode).toBe(503);
      const body = JSON.parse(response.body);
      expect(body).toMatchObject({
        status: 'unhealthy',
        database: 'disconnected',
      });
      expect(body.timestamp).toBeDefined();
    });
  });
});
