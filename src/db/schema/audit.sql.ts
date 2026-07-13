import {
  pgTable,
  uuid,
  varchar,
  bigint,
  timestamp,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { claims } from './claims.sql';

export const claimAuditLog = pgTable(
  'claim_audit_log',
  {
    id: bigint('id', { mode: 'number' }).primaryKey().generatedAlwaysAsIdentity(),
    claimId: uuid('claim_id')
      .notNull()
      .references(() => claims.id),
    action: varchar('action', { length: 50 }).notNull(),
    actorId: uuid('actor_id'),
    actorRole: varchar('actor_role', { length: 30 }),
    previousStatus: varchar('previous_status', { length: 30 }),
    newStatus: varchar('new_status', { length: 30 }),
    verificationData: jsonb('verification_data'),
    fabricTxId: varchar('fabric_tx_id', { length: 100 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_audit_claim').on(table.claimId, table.createdAt)]
);
