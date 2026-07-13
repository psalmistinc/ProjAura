import { describe, it, expect } from 'vitest';
import { sha256, generateIdempotencyKey, verifySignature } from '@/lib/utils/crypto';

describe('Crypto Utils', () => {
  describe('sha256', () => {
    it('should produce consistent hash', () => {
      const hash1 = sha256('test-data');
      const hash2 = sha256('test-data');
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it('should produce different hash for different input', () => {
      const hash1 = sha256('data-1');
      const hash2 = sha256('data-2');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('generateIdempotencyKey', () => {
    it('should generate unique keys', () => {
      const key1 = generateIdempotencyKey();
      const key2 = generateIdempotencyKey();
      expect(key1).not.toBe(key2);
      expect(key1).toHaveLength(64);
    });
  });

  describe('verifySignature', () => {
    it('should verify valid signature', () => {
      const secret = 'test-secret';
      const payload = 'test-payload';
      const crypto = require('crypto');
      const expectedSig = crypto.createHash('sha256').update(`${secret}.${payload}`).digest('hex');
      expect(verifySignature(payload, expectedSig, secret)).toBe(true);
    });

    it('should reject invalid signature', () => {
      expect(verifySignature('payload', 'invalid-sig', 'secret')).toBe(false);
    });
  });
});
