import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const shareStatusEnum = pgEnum('share_status', [
  'ACTIVE',
  'EXPIRED',
  'REVOKED',
]);

export const sharedReports = pgTable(
  'shared_reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    reportId: varchar('report_id', { length: 50 }).notNull(),
    reportTitle: varchar('report_title', { length: 200 }).notNull(),
    reportType: varchar('report_type', { length: 50 }).notNull(),
    reportData: text('report_data').notNull(),
    token: varchar('token', { length: 64 }).unique().notNull(),
    passwordHash: varchar('password_hash', { length: 128 }).notNull(),
    createdBy: varchar('created_by', { length: 100 }).notNull(),
    status: shareStatusEnum('status').notNull().default('ACTIVE'),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    accessCount: integer('access_count').notNull().default(0),
    maxAccessCount: integer('max_access_count'),
    lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_shared_reports_token').on(table.token),
    index('idx_shared_reports_report_id').on(table.reportId),
    index('idx_shared_reports_status').on(table.status),
  ]
);
