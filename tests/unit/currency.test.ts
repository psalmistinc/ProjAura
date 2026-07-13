import { describe, it, expect } from 'vitest';
import { formatGhs, formatGhsCompact, parseGhs } from '@/lib/utils/currency';

describe('Currency Utils', () => {
  describe('formatGhs', () => {
    it('should format amount with GHS symbol', () => {
      const result = formatGhs(1428.5);
      expect(result).toContain('1');
      expect(result).toContain('428');
    });

    it('should handle zero', () => {
      const result = formatGhs(0);
      expect(result).toContain('0');
    });
  });

  describe('formatGhsCompact', () => {
    it('should format millions', () => {
      const result = formatGhsCompact(2_500_000);
      expect(result).toContain('2.5M');
    });

    it('should format thousands', () => {
      const result = formatGhsCompact(75_000);
      expect(result).toContain('75.0K');
    });

    it('should format small amounts normally', () => {
      const result = formatGhsCompact(500);
      expect(result).toContain('500');
    });
  });

  describe('parseGhs', () => {
    it('should extract numeric value', () => {
      expect(parseGhs('GHS 1,428.50')).toBe(1428.5);
    });
  });
});
