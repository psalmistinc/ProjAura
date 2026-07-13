import { db } from '@/db';
import { claims } from '@/db/schema/claims.sql';
import { eq, and, lte, sql } from 'drizzle-orm';
import { FabricClient } from '@/server/lib/fabric';
import { NotificationService } from '@/server/lib/notifications';
import { SlaEngine } from '@/server/lib/sla.engine';

const fabricClient = new FabricClient();
const notifications = new NotificationService();
const slaEngine = new SlaEngine();

export class SlaCheckerWorker {
  private intervalId: NodeJS.Timeout | null = null;

  start(intervalMs: number = 300_000) {
    console.log('[SLA Checker] Starting with interval:', intervalMs, 'ms');
    this.tick(); // Run immediately
    this.intervalId = setInterval(() => this.tick(), intervalMs);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('[SLA Checker] Stopped');
    }
  }

  async tick() {
    console.log('[SLA Checker] Running tick...', new Date().toISOString());

    try {
      // 1. Find claims approaching breach (70% elapsed)
      const atRiskClaims = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.status, 'SLA_ACTIVE'),
            sql`${claims.slaDeadline} > NOW()`,
            sql`(EXTRACT(EPOCH FROM (NOW() - ${claims.slaStartedAt})) / NULLIF(EXTRACT(EPOCH FROM (${claims.slaDeadline} - ${claims.slaStartedAt})), 0)) >= 0.7`
          )
        );

      for (const claim of atRiskClaims) {
        const timer = slaEngine.evaluateTimer(
          claim.id,
          claim.slaStartedAt!,
          claim.slaDeadline!
        );

        if (timer.status === 'AT_RISK') {
          await notifications.send({
            type: 'SLA_AT_RISK',
            claimId: claim.id,
            orgId: claim.claimantOrgId,
            deadline: claim.slaDeadline,
          });

          await fabricClient.updateSLAStatus(claim.id, 'SLA_AT_RISK');
          console.log(`[SLA Checker] At risk: ${claim.id}`);
        }
      }

      // 2. Find breached claims
      const breachedClaims = await db
        .select()
        .from(claims)
        .where(
          and(
            eq(claims.status, 'SLA_ACTIVE'),
            lte(claims.slaDeadline, new Date())
          )
        );

      for (const claim of breachedClaims) {
        await db
          .update(claims)
          .set({
            status: 'SLA_BREACHED',
            slaBreachedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(claims.id, claim.id));

        await notifications.send({
          type: 'SLA_BREACHED',
          claimId: claim.id,
          orgId: claim.claimantOrgId,
        });

        await fabricClient.updateSLAStatus(claim.id, 'SLA_BREACHED');
        console.log(`[SLA Checker] Breached: ${claim.id}`);
      }

      console.log(
        `[SLA Checker] Processed: ${atRiskClaims.length} at-risk, ${breachedClaims.length} breached`
      );
    } catch (error) {
      console.error('[SLA Checker] Error:', error);
    }
  }
}

// Auto-start in development
if (process.env.NODE_ENV === 'development') {
  const worker = new SlaCheckerWorker();
  worker.start(60_000); // Every minute in dev
}
