export interface SLATimer {
  claimId: string;
  deadline: Date;
  startedAt: Date;
  elapsedPercentage: number;
  remainingMs: number;
  status: 'ON_TRACK' | 'AT_RISK' | 'BREACHED';
}

export interface SLAConfig {
  underRecoveryDays: number;
  uppfDays: number;
  escalationThreshold: number;
}

const DEFAULT_SLA_CONFIG: SLAConfig = {
  underRecoveryDays: 14,
  uppfDays: 21,
  escalationThreshold: 0.7,
};

export class SlaEngine {
  private config: SLAConfig;

  constructor(config: Partial<SLAConfig> = {}) {
    this.config = { ...DEFAULT_SLA_CONFIG, ...config };
  }

  calculateDeadline(claimType: string, startDate: Date = new Date()): Date {
    const businessDays =
      claimType === 'UPPF'
        ? this.config.uppfDays
        : this.config.underRecoveryDays;

    const deadline = new Date(startDate);
    let added = 0;

    while (added < businessDays) {
      deadline.setDate(deadline.getDate() + 1);
      const day = deadline.getDay();
      if (day !== 0 && day !== 6) added++;
    }

    deadline.setHours(17, 0, 0, 0);
    return deadline;
  }

  evaluateTimer(claimId: string, startedAt: Date, deadline: Date): SLATimer {
    const now = new Date();
    const totalMs = deadline.getTime() - startedAt.getTime();
    const elapsedMs = now.getTime() - startedAt.getTime();
    const remainingMs = Math.max(0, deadline.getTime() - now.getTime());
    const elapsedPercentage = Math.min(1, elapsedMs / totalMs);

    let status: SLATimer['status'] = 'ON_TRACK';
    if (now >= deadline) {
      status = 'BREACHED';
    } else if (elapsedPercentage >= this.config.escalationThreshold) {
      status = 'AT_RISK';
    }

    return {
      claimId,
      deadline,
      startedAt,
      elapsedPercentage,
      remainingMs,
      status,
    };
  }

  formatRemaining(remainingMs: number): string {
    if (remainingMs <= 0) return 'Breached';

    const days = Math.floor(remainingMs / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (remainingMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor(
      (remainingMs % (1000 * 60 * 60)) / (1000 * 60)
    );

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  shouldEscalate(timer: SLATimer): boolean {
    return (
      timer.status === 'AT_RISK' || timer.status === 'BREACHED'
    );
  }

  getPublicCountdown(timer: SLATimer) {
    return {
      claimId: timer.claimId,
      deadline: timer.deadline.toISOString(),
      remaining: this.formatRemaining(timer.remainingMs),
      progressPct: Math.round(timer.elapsedPercentage * 100),
      status: timer.status,
    };
  }
}
