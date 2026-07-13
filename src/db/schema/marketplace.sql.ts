import {
  pgTable,
  uuid,
  varchar,
  decimal,
  integer,
  timestamp,
  date,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';
import { claims } from './claims.sql';

export const assetStatusEnum = pgEnum('asset_status', [
  'LISTED',
  'BIDDING_ACTIVE',
  'MATCHED',
  'SETTLED',
  'MATURED_UNPAID',
]);

export const bidStatusEnum = pgEnum('bid_status', [
  'ACTIVE',
  'ACCEPTED',
  'REJECTED',
  'EXPIRED',
]);

export const settlementStatusEnum = pgEnum('settlement_status', [
  'PENDING',
  'RTGS_SUBMITTED',
  'CONFIRMED',
  'FAILED',
  'DISPUTED',
]);

export const marketplaceAssets = pgTable(
  'marketplace_assets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    claimId: uuid('claim_id')
      .notNull()
      .references(() => claims.id)
      .unique(),
    faceValueGhs: decimal('face_value_ghs', { precision: 18, scale: 2 }).notNull(),
    fuelType: varchar('fuel_type', { length: 20 }).notNull(),
    claimantOrgId: uuid('claimant_org_id').notNull(),
    maturityDate: date('maturity_date').notNull(),
    riskScore: decimal('risk_score', { precision: 3, scale: 1 }),
    assetStatus: assetStatusEnum('asset_status').notNull().default('LISTED'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_assets_status').on(table.assetStatus),
    index('idx_assets_maturity').on(table.maturityDate),
    index('idx_assets_claimant').on(table.claimantOrgId),
  ]
);

export const bids = pgTable(
  'bids',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => marketplaceAssets.id),
    bidderOrgId: uuid('bidder_org_id').notNull(),
    discountRate: decimal('discount_rate', { precision: 5, scale: 4 }).notNull(),
    fundedAmountGhs: decimal('funded_amount_ghs', { precision: 18, scale: 2 }).notNull(),
    tenorDays: integer('tenor_days').notNull(),
    bidStatus: bidStatusEnum('bid_status').notNull().default('ACTIVE'),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_bids_asset').on(table.assetId),
    index('idx_bids_bidder').on(table.bidderOrgId),
    index('idx_bids_status').on(table.bidStatus),
  ]
);

export const settlements = pgTable(
  'settlements',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    assetId: uuid('asset_id')
      .notNull()
      .references(() => marketplaceAssets.id),
    winningBidId: uuid('winning_bid_id')
      .notNull()
      .references(() => bids.id),
    claimantOrgId: uuid('claimant_org_id').notNull(),
    bidderOrgId: uuid('bidder_org_id').notNull(),
    settlementAmount: decimal('settlement_amount', { precision: 18, scale: 2 }).notNull(),
    discountAmount: decimal('discount_amount', { precision: 18, scale: 2 }).notNull(),
    fundedAmountGhs: decimal('funded_amount_ghs', { precision: 18, scale: 2 }).notNull(),
    rtgsReference: varchar('rtgs_reference', { length: 50 }),
    settledAt: timestamp('settled_at', { withTimezone: true }),
    fabricTxId: varchar('fabric_tx_id', { length: 100 }),
    status: settlementStatusEnum('status').notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_settlements_asset').on(table.assetId),
    index('idx_settlements_status').on(table.status),
  ]
);
