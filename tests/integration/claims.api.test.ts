import { describe, it, expect, vi, beforeEach } from 'vitest';
import { claimQuerySchema, claimSubmissionSchema } from '@/lib/schemas/claims';

describe('Claims API Validation', () => {
  describe('claimQuerySchema', () => {
    it('should validate valid query params', () => {
      const result = claimQuerySchema.parse({
        status: 'SUBMITTED',
        claimType: 'UPPF',
        page: '1',
        limit: '20',
      });
      expect(result.status).toBe('SUBMITTED');
      expect(result.claimType).toBe('UPPF');
      expect(result.page).toBe(1);
    });

    it('should apply defaults', () => {
      const result = claimQuerySchema.parse({});
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
      expect(result.sortBy).toBe('created_at');
      expect(result.sortOrder).toBe('desc');
    });

    it('should reject invalid status', () => {
      expect(() => claimQuerySchema.parse({ status: 'INVALID' })).toThrow();
    });

    it('should reject invalid page', () => {
      expect(() => claimQuerySchema.parse({ page: '-1' })).toThrow();
    });
  });

  describe('claimSubmissionSchema', () => {
    it('should validate valid submission', () => {
      const result = claimSubmissionSchema.parse({
        claimType: 'UPPF',
        npaReference: 'NPA-001',
        fuelType: 'PMS',
        volumeLiters: 50000,
        claimedAmountGhs: 750000,
      });
      expect(result.claimType).toBe('UPPF');
    });

    it('should reject missing required fields', () => {
      expect(() => claimSubmissionSchema.parse({})).toThrow();
    });

    it('should reject negative volume', () => {
      expect(() =>
        claimSubmissionSchema.parse({
          claimType: 'UPPF',
          npaReference: 'NPA-001',
          fuelType: 'PMS',
          volumeLiters: -100,
          claimedAmountGhs: 750000,
        })
      ).toThrow();
    });
  });
});
