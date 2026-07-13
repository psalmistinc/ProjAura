import {
  pgTable,
  uuid,
  varchar,
  decimal,
  text,
  timestamp,
  boolean,
  integer,
  pgEnum,
  index,
} from 'drizzle-orm/pg-core';

export const fuelPrices = pgTable(
  'fuel_prices',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    fuelType: varchar('fuel_type', { length: 20 }).notNull(),
    pumpPriceGhs: decimal('pump_price_ghs', { precision: 10, scale: 2 }).notNull(),
    exPumpPriceGhs: decimal('ex_pump_price_ghs', { precision: 10, scale: 2 }).notNull(),
    effectiveDate: timestamp('effective_date', { withTimezone: true }).notNull(),
    source: varchar('source', { length: 50 }).notNull().default('NPA'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_prices_fuel_type').on(table.fuelType),
    index('idx_prices_effective').on(table.effectiveDate),
  ]
);

export const stationLicenseStatusEnum = pgEnum('station_license_status', [
  'ACTIVE',
  'EXPIRED',
  'SUSPENDED',
]);

export const fuelMarkingStatusEnum = pgEnum('fuel_marking_status', [
  'COMPLIANT',
  'PENDING',
  'NON_COMPLIANT',
]);

export const stations = pgTable(
  'stations',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    npaStationId: varchar('npa_station_id', { length: 50 }).unique().notNull(),
    stationName: varchar('station_name', { length: 200 }).notNull(),
    region: varchar('region', { length: 50 }).notNull(),
    district: varchar('district', { length: 100 }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }),
    longitude: decimal('longitude', { precision: 10, scale: 7 }),
    licenseStatus: stationLicenseStatusEnum('license_status').notNull().default('ACTIVE'),
    licenseExpiry: timestamp('license_expiry', { withTimezone: true }),
    lastInspection: timestamp('last_inspection', { withTimezone: true }),
    fuelMarkingCompliance: fuelMarkingStatusEnum('fuel_marking_compliance').notNull().default('PENDING'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_stations_region').on(table.region),
    index('idx_stations_license').on(table.licenseStatus),
  ]
);

export const complaintTypeEnum = pgEnum('complaint_type', [
  'SHORT_DISPENSING',
  'FUEL_ADULTERATION',
  'PRICE_GOUGING',
  'UNLICENSED_SALE',
]);

export const reportStatusEnum = pgEnum('report_status', [
  'RECEIVED',
  'TRIAGED',
  'FORWARDED_TO_NPA',
  'UNDER_INVESTIGATION',
  'RESOLVED',
  'DISMISSED',
]);

export const reports = pgTable(
  'reports',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    complaintType: complaintTypeEnum('complaint_type').notNull(),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    description: text('description'),
    stationId: uuid('station_id').references(() => stations.id),
    evidenceUrl: varchar('evidence_url', { length: 500 }),
    status: reportStatusEnum('status').notNull().default('RECEIVED'),
    priority: integer('priority').notNull().default(50),
    confidence: decimal('confidence', { precision: 3, scale: 2 }).default('0.5'),
    isDuplicate: boolean('is_duplicate').notNull().default(false),
    npaReportId: varchar('npa_report_id', { length: 50 }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('idx_reports_status').on(table.status),
    index('idx_reports_type').on(table.complaintType),
    index('idx_reports_priority').on(table.priority),
  ]
);
