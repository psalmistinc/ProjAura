import { vi } from 'vitest';

// Mock environment variables for tests
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/aura_test';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.NEXTAUTH_SECRET = 'test-secret-key-at-least-32-characters-long';
process.env.NEXTAUTH_URL = 'http://localhost:3000';
process.env.NPA_API_BASE_URL = 'https://api.npa.gov.gh/v1';
process.env.NPA_API_KEY = 'test-npa-key';
process.env.NPA_WEBHOOK_SECRET = 'test-npa-webhook';
process.env.RTGS_API_BASE_URL = 'https://rtgs.bog.gov.gh/v1';
process.env.RTGS_API_KEY = 'test-rtgs-key';
process.env.FABRIC_CHANNEL_NAME = 'UPPF_Claims';
process.env.FABRIC_CHAINCODE_NAME = 'claims';
process.env.FABRIC_MSP_ID = 'AuraMSP';
process.env.FABRIC_PEER_ENDPOINT = 'localhost:7051';
process.env.FABRIC_CA_ENDPOINT = 'localhost:7054';
process.env.APP_ENV = 'development';
process.env.ENABLE_MOCKS = 'true';
