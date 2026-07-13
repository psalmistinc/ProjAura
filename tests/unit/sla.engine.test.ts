import { describe, it, expect } from 'vitest';
import { SlaEngine } from '@/server/lib/sla.engine';

describe('SlaEngine', () => {
  const engine = new SlaEngine();

  describe('calculateDeadline', () => {
    it('should calculate 14 business days for UNDER_RECOVERY', () => {
      const start = new Date('2026-07-13'); // Monday
      const deadline = engine.calculateDeadline('UNDER_RECOVERY', start);
      expect(deadline).toBeInstanceOf(Date);
      expect(deadline.getDay()).not.toBe(0); // Not Sunday
      expect(deadline.getDay()).not.toBe(6); // Not Saturday
    });

    it('should calculate 21 business days for UPPF', () => {
      const start = new Date('2026-07-13');
      const deadline = engine.calculateDeadline('UPPF', start);
      expect(deadline).toBeInstanceOf(Date);
    });
  });

  describe('evaluateTimer', () => {
    it('should return ON_TRACK when < 70% elapsed', () => {
      const startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
      const timer = engine.evaluateTimer('claim-1', startedAt, deadline);
      expect(timer.status).toBe('ON_TRACK');
    });

    it('should return AT_RISK when >= 70% elapsed', () => {
      const startedAt = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
      const timer = engine.evaluateTimer('claim-1', startedAt, deadline);
      expect(timer.status).toBe('AT_RISK');
    });

    it('should return BREACHED when deadline passed', () => {
      const startedAt = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
      const timer = engine.evaluateTimer('claim-1', startedAt, deadline);
      expect(timer.status).toBe('BREACHED');
    });
  });

  describe('formatRemaining', () => {
    it('should format days and hours', () => {
      const ms = 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000;
      expect(engine.formatRemaining(ms)).toBe('2d 5h 0m');
    });

    it('should format hours and minutes', () => {
      const ms = 3 * 60 * 60 * 1000 + 45 * 60 * 1000;
      expect(engine.formatRemaining(ms)).toBe('3h 45m');
    });

    it('should return Breached for 0 or negative', () => {
      expect(engine.formatRemaining(0)).toBe('Breached');
      expect(engine.formatRemaining(-1000)).toBe('Breached');
    });
  });

  describe('getPublicCountdown', () => {
    it('should return structured countdown data', () => {
      const startedAt = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
      const deadline = new Date(Date.now() + 12 * 24 * 60 * 60 * 1000);
      const timer = engine.evaluateTimer('claim-1', startedAt, deadline);
      const countdown = engine.getPublicCountdown(timer);

      expect(countdown.claimId).toBe('claim-1');
      expect(countdown.status).toBe('ON_TRACK');
      expect(countdown.progressPct).toBeGreaterThan(0);
      expect(countdown.progressPct).toBeLessThan(100);
      expect(countdown.remaining).toBeTruthy();
    });
  });
});
