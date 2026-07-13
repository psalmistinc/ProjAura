import {
  pgTable,
  uuid,
  varchar,
  decimal,
  timestamp,
  text,
  jsonb,
  bigint,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const claimStatusEnum = pgEnum('claim_status', [
  'SUBMITTED',
  'NPA_DATA_CROSSED',
  'PHYSICAL_DELIVERY_CONFIRMED',
  'VERIFIED_LOGGED',
  'SLA_ACTIVE',
  'SLA_BREACHED',
  'PAID',
  'DISPUTED',
  'REJECTED',
]);

export const claimTypeEnum = pgEnum('claim_type', [
  'UNDER_RECOVERY',
  'UPPF',
]);

export const fuelTypeEnum = pgEnum('fuel_type', [
  'PMS',
  'GO',
  'AGO',
  'LPG',
]);

export const claims = pgTable(
  'claims',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    claimType: claimTypeEnum('claim_type').notNull(),
    claimantOrgId: uuid('claimant_org_id').notNull(),
    npaReference: varchar('npa_reference', { length: 50 }).unique().notNull(),
    brvManifestId: varchar('brv_manifest_id', { length: 50 }),
    fuelType: fuelTypeEnum('fuel_type').notNull(),
    volumeLiters: decimal('volume_liters', { precision: 15, scale: 3 }).notNull(),
    claimedAmountGhs: decimal('claimed_amount_ghs', { precision: 18, scale: 2 }).notNull(),
    exchangeRateUsd: decimal('exchange_rate_usd', { precision: 10, scale: 4 }),
    supportingDocs: text('supporting_docs').array(),
    status: claimStatusEnum('status').notNull().default('SUBMITTED'),
    slaDeadline: timestamp('sla_deadline', { withTimezone: true }),
    slaStartedAt: timestamp('sla_started_at', { withTimezone: true }),
    slaBreachedAt: timestamp('sla_breached_at', { withTimezone: true }),
    fabricTxId: varchar('fabric_tx_id', { length: 100 }),
    merkleRoot: varchar('merkle_root', { length: 66 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_claims_status').on(table.status),
    index('idx_claims_sla_deadline').on(table.slaDeadline),
    index('idx_claims_claimant').on(table.claimantOrgId, table.status),
    index('idx_claims_created').on(table.createdAt),
  ]
);
