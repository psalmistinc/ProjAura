import { eq, and, desc, asc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  marketplaceAssets,
  bids,
  settlements,
} from '@/db/schema/marketplace.sql';
import type { AssetQuery, BidQuery, BidSubmission } from '@/lib/schemas/marketplace';

export class MarketplaceRepository {
  // --- Assets ---

  async findAssetById(id: string) {
    return db.query.marketplaceAssets.findFirst({
      where: eq(marketplaceAssets.id, id),
    });
  }

  async findManyAssets(query: AssetQuery) {
    const conditions = [];
    if (query.assetStatus)
      conditions.push(eq(marketplaceAssets.assetStatus, query.assetStatus));
    if (query.fuelType)
      conditions.push(eq(marketplaceAssets.fuelType, query.fuelType));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const sortColumnMap: Record<string, any> = {
      created_at: marketplaceAssets.createdAt,
      maturity_date: marketplaceAssets.maturityDate,
      fuel_type: marketplaceAssets.fuelType,
    };
    const sortColumn = sortColumnMap[query.sortBy] ?? marketplaceAssets.createdAt;

    const [data, countResult] = await Promise.all([
      db.query.marketplaceAssets.findMany({
        where,
        orderBy: query.sortOrder === 'desc' ? desc(sortColumn) : asc(sortColumn),
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      }),
      db
        .select({ value: count() })
        .from(marketplaceAssets)
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

  async createAsset(data: {
    claimId: string;
    faceValueGhs: string;
    fuelType: string;
    claimantOrgId: string;
    maturityDate: string;
    riskScore?: string;
  }) {
    const [asset] = await db
      .insert(marketplaceAssets)
      .values({
        ...data,
        assetStatus: 'LISTED',
      })
      .returning();
    return asset;
  }

  async updateAssetStatus(id: string, status: string) {
    const [updated] = await db
      .update(marketplaceAssets)
      .set({ assetStatus: status as any })
      .where(eq(marketplaceAssets.id, id))
      .returning();
    return updated;
  }

  async getAssetsByClaimant(orgId: string) {
    return db.query.marketplaceAssets.findMany({
      where: eq(marketplaceAssets.claimantOrgId, orgId),
      orderBy: [desc(marketplaceAssets.createdAt)],
    });
  }

  // --- Bids ---

  async findBidById(id: string) {
    return db.query.bids.findFirst({
      where: eq(bids.id, id),
    });
  }

  async findManyBids(query: BidQuery) {
    const conditions = [];
    if (query.assetId) conditions.push(eq(bids.assetId, query.assetId));
    if (query.bidderOrgId)
      conditions.push(eq(bids.bidderOrgId, query.bidderOrgId));
    if (query.bidStatus)
      conditions.push(eq(bids.bidStatus, query.bidStatus));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.query.bids.findMany({
        where,
        orderBy: [desc(bids.createdAt)],
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      }),
      db
        .select({ value: count() })
        .from(bids)
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

  async createBid(data: BidSubmission, bidderOrgId: string) {
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + data.expirySeconds);

    const [bid] = await db
      .insert(bids)
      .values({
        assetId: data.assetId,
        bidderOrgId,
        discountRate: data.discountRate.toString(),
        fundedAmountGhs: data.fundedAmountGhs.toString(),
        tenorDays: data.tenorDays,
        expiresAt,
        bidStatus: 'ACTIVE',
      })
      .returning();
    return bid;
  }

  async findBestBidForAsset(assetId: string) {
    const result = await db.query.bids.findFirst({
      where: and(
        eq(bids.assetId, assetId),
        eq(bids.bidStatus, 'ACTIVE'),
        sql`${bids.expiresAt} > NOW()`
      ),
      orderBy: [asc(bids.discountRate)],
    });
    return result;
  }

  async updateBidStatus(id: string, status: string) {
    const [updated] = await db
      .update(bids)
      .set({ bidStatus: status as any })
      .where(eq(bids.id, id))
      .returning();
    return updated;
  }

  async expireStaleBids() {
    return db
      .update(bids)
      .set({ bidStatus: 'EXPIRED' })
      .where(
        and(
          eq(bids.bidStatus, 'ACTIVE'),
          sql`${bids.expiresAt} < NOW()`
        )
      )
      .returning();
  }

  // --- Settlements ---

  async createSettlement(data: {
    assetId: string;
    winningBidId: string;
    claimantOrgId: string;
    bidderOrgId: string;
    settlementAmount: string;
    discountAmount: string;
    fundedAmountGhs: string;
  }) {
    const [settlement] = await db
      .insert(settlements)
      .values({
        ...data,
        status: 'PENDING',
      })
      .returning();
    return settlement;
  }

  async findSettlementById(id: string) {
    return db.query.settlements.findFirst({
      where: eq(settlements.id, id),
    });
  }

  async updateSettlementStatus(
    id: string,
    status: string,
    rtgsReference?: string
  ) {
    const updateData: Record<string, unknown> = { status };
    if (rtgsReference) updateData.rtgsReference = rtgsReference;
    if (status === 'CONFIRMED') updateData.settledAt = new Date();

    const [updated] = await db
      .update(settlements)
      .set(updateData)
      .where(eq(settlements.id, id))
      .returning();
    return updated;
  }

  async findPendingSettlements() {
    return db.query.settlements.findMany({
      where: eq(settlements.status, 'PENDING'),
      orderBy: [asc(settlements.createdAt)],
    });
  }

  async getSettlementStats() {
    return db
      .select({
        status: settlements.status,
        count: count(),
        totalAmount: sql<string>`COALESCE(SUM(${settlements.settlementAmount}), 0)`,
      })
      .from(settlements)
      .groupBy(settlements.status);
  }
}
