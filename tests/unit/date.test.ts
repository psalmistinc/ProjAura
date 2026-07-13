import { describe, it, expect } from 'vitest';
import { calculateSLADeadline, formatSLARemaining, getSLAStatus } from '@/lib/utils/date';

describe('Date Utils', () => {
  describe('calculateSLADeadline', () => {
    it('should add business days excluding weekends', () => {
      const start = new Date('2026-07-13'); // Monday
      const deadline = calculateSLADeadline(start, 5);
      expect(deadline.getDate()).toBe(20); // Next Monday (5 business days)
    });
  });

  describe('formatSLARemaining', () => {
    it('should return Breached for past deadlines', () => {
      const past = new Date(Date.now() - 100000);
      expect(formatSLARemaining(past)).toBe('Breached');
    });

    it('should format days and hours for future deadlines', () => {
      const future = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000);
      const result = formatSLARemaining(future);
      expect(result).toMatch(/\d+d \d+h/);
    });
  });

  describe('getSLAStatus', () => {
    it('should return BREACHED for past deadline', () => {
      const past = new Date(Date.now() - 100000);
      expect(getSLAStatus(past, 0.5)).toBe('BREACHED');
    });

    it('should return AT_RISK when elapsed >= 70%', () => {
      const future = new Date(Date.now() + 100000);
      expect(getSLAStatus(future, 0.8)).toBe('AT_RISK');
    });

    it('should return ON_TRACK when elapsed < 70%', () => {
      const future = new Date(Date.now() + 100000);
      expect(getSLAStatus(future, 0.5)).toBe('ON_TRACK');
    });
  });
});
