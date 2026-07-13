import { eq, and, desc, asc, sql, count } from 'drizzle-orm';
import { db } from '@/db';
import { claims } from '@/db/schema/claims.sql';
import { claimAuditLog } from '@/db/schema/audit.sql';
import type { ClaimQuery, ClaimSubmission } from '@/lib/schemas/claims';

export class ClaimsRepository {
  async findById(id: string) {
    return db.query.claims.findFirst({
      where: eq(claims.id, id),
    });
  }

  async findByNpaReference(npaReference: string) {
    return db.query.claims.findFirst({
      where: eq(claims.npaReference, npaReference),
    });
  }

  async findMany(query: ClaimQuery) {
    const conditions = [];
    if (query.status) conditions.push(eq(claims.status, query.status));
    if (query.claimType) conditions.push(eq(claims.claimType, query.claimType));
    if (query.claimantOrgId) conditions.push(eq(claims.claimantOrgId, query.claimantOrgId));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumnMap: Record<string, any> = {
      created_at: claims.createdAt,
      sla_deadline: claims.slaDeadline,
      claimed_amount_ghs: claims.claimedAmountGhs,
    };
    const sortColumn = sortColumnMap[query.sortBy] ?? claims.createdAt;

    const [data, countResult] = await Promise.all([
      db.query.claims.findMany({
        where,
        orderBy: query.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn),
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      }),
      db
        .select({ value: count() })
        .from(claims)
        .where(where)
        .then((r) => r[0].value),
    ]);

    return {
      data,
      count: countResult,
      page: query.page,
      limit: query.limit,
      totalPages: Math.ceil(countResult / query.limit),
    };
  }

  async create(data: ClaimSubmission, orgId: string) {
    return db.transaction(async (tx) => {
      const [claim] = await tx
        .insert(claims)
        .values({
          claimType: data.claimType,
          npaReference: data.npaReference,
          brvManifestId: data.brvManifestId,
          fuelType: data.fuelType,
          volumeLiters: String(data.volumeLiters),
          claimedAmountGhs: String(data.claimedAmountGhs),
          exchangeRateUsd: data.exchangeRateUsd != null ? String(data.exchangeRateUsd) : undefined,
          supportingDocs: data.supportingDocs,
          claimantOrgId: orgId,
          status: 'SUBMITTED',
        })
        .returning();

      await tx.insert(claimAuditLog).values({
        claimId: claim.id,
        action: 'SUBMITTED',
        actorId: orgId,
        actorRole: 'CLAIMANT',
        newStatus: 'SUBMITTED',
      });

      return claim;
    });
  }

  async updateStatus(
    id: string,
    newStatus: string,
    actorId: string,
    actorRole: string,
    additionalData?: Record<string, unknown>
  ) {
    return db.transaction(async (tx) => {
      const existing = await tx.query.claims.findFirst({
        where: eq(claims.id, id),
      });

      if (!existing) {
        throw new Error(`Claim ${id} not found`);
      }

      const updateData: Record<string, unknown> = {
        status: newStatus,
        updatedAt: new Date(),
      };

      if (newStatus === 'VERIFIED_LOGGED') {
        updateData.slaStartedAt = new Date();
        updateData.slaDeadline = this.calculateSLADeadline(
          existing.claimType,
          new Date()
        );
      }

      if (newStatus === 'SLA_BREACHED') {
        updateData.slaBreachedAt = new Date();
      }

      if (additionalData?.fabricTxId) {
        updateData.fabricTxId = additionalData.fabricTxId;
      }

      const [updated] = await tx
        .update(claims)
        .set(updateData)
        .where(eq(claims.id, id))
        .returning();

      await tx.insert(claimAuditLog).values({
        claimId: id,
        action: `STATUS_CHANGED_TO_${newStatus}`,
        actorId,
        actorRole,
        previousStatus: existing.status,
        newStatus,
        verificationData: additionalData,
        fabricTxId: additionalData?.fabricTxId as string | undefined,
      });

      return updated;
    });
  }

  async getAuditLog(claimId: string) {
    return db.query.claimAuditLog.findMany({
      where: eq(claimAuditLog.claimId, claimId),
      orderBy: [desc(claimAuditLog.createdAt)],
    });
  }

  async findActiveSLAClaims() {
    return db.query.claims.findMany({
      where: eq(claims.status, 'SLA_ACTIVE'),
      orderBy: [asc(claims.slaDeadline)],
    });
  }

  async findBreachedClaims() {
    return db.query.claims.findMany({
      where: and(
        eq(claims.status, 'SLA_ACTIVE'),
        sql`${claims.slaDeadline} < NOW()`
      ),
    });
  }

  async findAtRiskClaims(thresholdPercentage: number = 0.7) {
    return db.query.claims.findMany({
      where: and(
        eq(claims.status, 'SLA_ACTIVE'),
        sql`${claims.slaDeadline} > NOW()`,
        sql`(EXTRACT(EPOCH FROM (NOW() - ${claims.slaStartedAt})) / EXTRACT(EPOCH FROM (${claims.slaDeadline} - ${claims.slaStartedAt}))) >= ${thresholdPercentage}`
      ),
    });
  }

  async getStats(orgId?: string) {
    const conditions = orgId ? [eq(claims.claimantOrgId, orgId)] : [];
    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await db
      .select({
        status: claims.status,
        count: count(),
      })
      .from(claims)
      .where(where)
      .groupBy(claims.status);

    return result;
  }

  private calculateSLADeadline(claimType: string, startDate: Date): Date {
    const businessDays = claimType === 'UPPF' ? 21 : 14;
    const deadline = new Date(startDate);
    let businessDaysAdded = 0;

    while (businessDaysAdded < businessDays) {
      deadline.setDate(deadline.getDate() + 1);
      const day = deadline.getDay();
      if (day !== 0 && day !== 6) {
        businessDaysAdded++;
      }
    }

    deadline.setHours(17, 0, 0, 0);
    return deadline;
  }
}
