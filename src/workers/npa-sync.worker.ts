import { ReportsService } from '@/server/public-gateway/reports.service';
import { ReportsRepository } from '@/server/public-gateway/reports.repository';
import { NpaClient } from '@/server/npa-integration/npa.client';

const npaClient = new NpaClient();
const reportsRepo = new ReportsRepository();
const reportsService = new ReportsService(reportsRepo, npaClient);

export class NpaSyncWorker {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 21_600_000) {
    console.log('[NPA Sync] Starting with interval:', intervalMs, 'ms');
    this.tick();
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[NPA Sync] Stopped');
    }
  }

  async tick() {
    console.log('[NPA Sync] Running tick...', new Date().toISOString());

    try {
      // Sync latest fuel prices from NPA
      const prices = await reportsService.syncPricesFromNpa();
      console.log(`[NPA Sync] Synced ${prices.length} fuel prices`);
    } catch (error) {
      console.error('[NPA Sync] Price sync error:', error);
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  const worker = new NpaSyncWorker();
  worker.start(300_000); // Every 5 minutes in dev
}
