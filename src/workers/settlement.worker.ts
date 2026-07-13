import { db } from '@/db';
import { settlements } from '@/db/schema/marketplace.sql';
import { eq } from 'drizzle-orm';
import { RtgsClient } from '@/server/settlement/rtgs.client';
import { FabricClient } from '@/server/lib/fabric';
import { NotificationService } from '@/server/lib/notifications';

const rtgsClient = new RtgsClient();
const fabricClient = new FabricClient();
const notifications = new NotificationService();

export class SettlementWorker {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 60_000) {
    console.log('[Settlement Worker] Starting with interval:', intervalMs, 'ms');
    this.tick();
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[Settlement Worker] Stopped');
    }
  }

  async tick() {
    console.log('[Settlement Worker] Running tick...', new Date().toISOString());

    try {
      const pendingSettlements = await db
        .select()
        .from(settlements)
        .where(eq(settlements.status, 'PENDING'));

      for (const settlement of pendingSettlements) {
        try {
          // 1. Initiate RTGS transfer
          const rtgsResult = await rtgsClient.initiateTransfer({
            fromAccount: settlement.bidderOrgId,
            toAccount: settlement.claimantOrgId,
            amount: parseFloat(settlement.settlementAmount),
            currency: 'GHS',
            reference: settlement.id,
            narrative: `Aura Marketplace Settlement ${settlement.id}`,
          });

          // 2. Update settlement status
          await db
            .update(settlements)
            .set({
              status: 'RTGS_SUBMITTED',
              rtgsReference: rtgsResult.transactionId,
            })
            .where(eq(settlements.id, settlement.id));

          // 3. Check if already settled (mock mode)
          if (rtgsResult.status === 'SETTLED') {
            await db
              .update(settlements)
              .set({
                status: 'CONFIRMED',
                settledAt: new Date(),
              })
              .where(eq(settlements.id, settlement.id));

            // Anchor to Fabric
            await fabricClient.logSettlement({
              assetId: settlement.assetId,
              settlementId: settlement.id,
              amount: parseFloat(settlement.settlementAmount),
              fromOrg: settlement.bidderOrgId,
              toOrg: settlement.claimantOrgId,
            });

            await notifications.send({
              type: 'SETTLEMENT_INITIATED',
              assetId: settlement.assetId,
              orgId: settlement.claimantOrgId,
              metadata: { settlementId: settlement.id, status: 'CONFIRMED' },
            });

            console.log(`[Settlement Worker] Confirmed: ${settlement.id}`);
          }
        } catch (error) {
          console.error(`[Settlement Worker] Failed settlement ${settlement.id}:`, error);
          await db
            .update(settlements)
            .set({ status: 'FAILED' })
            .where(eq(settlements.id, settlement.id));
        }
      }

      console.log(`[Settlement Worker] Processed ${pendingSettlements.length} settlements`);
    } catch (error) {
      console.error('[Settlement Worker] Error:', error);
    }
  }
}

if (process.env.NODE_ENV === 'development') {
  const worker = new SettlementWorker();
  worker.start(30_000); // Every 30 seconds in dev
}
