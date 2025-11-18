// Jest setup file
// This file runs before all tests

// Set test timeout
jest.setTimeout(10000);

// Mock environment variables if needed
process.env.NODE_ENV = 'test';
process.env.PORT = '3001';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.SESSION_SECRET = 'test-secret-key-for-testing-only';
