import { eq, and, desc, count, sql } from 'drizzle-orm';
import { db } from '@/db';
import {
  fuelPrices,
  stations,
  reports,
} from '@/db/schema/public-gateway.sql';
import type {
  PriceQuery,
  StationQuery,
  ReportQuery,
  ReportSubmission,
} from '@/lib/schemas/public-gateway';

export class ReportsRepository {
  // --- Fuel Prices ---

  async getLatestPrices(query: PriceQuery) {
    const conditions = [];
    if (query.fuelType)
      conditions.push(eq(fuelPrices.fuelType, query.fuelType));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    return db.query.fuelPrices.findMany({
      where,
      orderBy: [desc(fuelPrices.effectiveDate)],
      limit: query.fuelType ? 1 : 10,
    });
  }

  async getAllCurrentPrices() {
    const subquery = db
      .select({
        fuelType: fuelPrices.fuelType,
        maxDate: sql<Date>`MAX(${fuelPrices.effectiveDate})`.as('max_date'),
      })
      .from(fuelPrices)
      .groupBy(fuelPrices.fuelType)
      .as('latest');

    return db
      .select()
      .from(fuelPrices)
      .innerJoin(
        subquery,
        and(
          eq(fuelPrices.fuelType, subquery.fuelType),
          eq(fuelPrices.effectiveDate, subquery.maxDate)
        )
      );
  }

  async createFuelPrice(data: {
    fuelType: string;
    pumpPriceGhs: string;
    exPumpPriceGhs: string;
    effectiveDate: Date;
    source?: string;
  }) {
    const [price] = await db
      .insert(fuelPrices)
      .values({
        ...data,
        source: data.source ?? 'NPA',
      })
      .returning();
    return price;
  }

  // --- Stations ---

  async findStationById(id: string) {
    return db.query.stations.findFirst({
      where: eq(stations.id, id),
    });
  }

  async findStationByNpaId(npaStationId: string) {
    return db.query.stations.findFirst({
      where: eq(stations.npaStationId, npaStationId),
    });
  }

  async findManyStations(query: StationQuery) {
    const conditions = [];
    if (query.region) conditions.push(eq(stations.region, query.region));
    if (query.stationName)
      conditions.push(
        sql`${stations.stationName} ILIKE ${`%${query.stationName}%`}`
      );

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.query.stations.findMany({
        where,
        orderBy: [desc(stations.stationName)],
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      }),
      db
        .select({ value: count() })
        .from(stations)
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

  async getStationLicenseStatus(stationId: string) {
    return db.query.stations.findFirst({
      where: eq(stations.id, stationId),
      columns: {
        id: true,
        npaStationId: true,
        stationName: true,
        licenseStatus: true,
        licenseExpiry: true,
        lastInspection: true,
        fuelMarkingCompliance: true,
      },
    });
  }

  // --- Reports ---

  async findReportById(id: string) {
    return db.query.reports.findFirst({
      where: eq(reports.id, id),
    });
  }

  async findManyReports(query: ReportQuery) {
    const conditions = [];
    if (query.status) conditions.push(eq(reports.status, query.status));
    if (query.complaintType)
      conditions.push(eq(reports.complaintType, query.complaintType));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const [data, countResult] = await Promise.all([
      db.query.reports.findMany({
        where,
        orderBy: [desc(reports.priority), desc(reports.createdAt)],
        limit: query.limit,
        offset: (query.page - 1) * query.limit,
      }),
      db
        .select({ value: count() })
        .from(reports)
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

  async createReport(data: ReportSubmission, evidenceUrl?: string) {
    const [report] = await db
      .insert(reports)
      .values({
        latitude: String(data.latitude),
        longitude: String(data.longitude),
        complaintType: data.complaintType as any,
        description: data.description,
        stationId: data.stationId,
        evidenceUrl,
        status: 'RECEIVED',
        priority: 50,
        confidence: '0.5',
      })
      .returning();
    return report;
  }

  async findNearbyReports(
    latitude: number,
    longitude: number,
    radiusMeters: number = 500,
    complaintType: string
  ) {
    return db
      .select()
      .from(reports)
      .where(
        and(
          eq(reports.complaintType, complaintType as any),
          sql`ST_DWithin(
            ST_SetSRID(ST_MakePoint(${reports.longitude}, ${reports.latitude}), 4326)::geography,
            ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}), 4326)::geography,
            ${radiusMeters}
          )`,
          sql`${reports.createdAt} > NOW() - INTERVAL '7 days'`
        )
      );
  }

  async updateReportStatus(id: string, status: string, npaReportId?: string) {
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };
    if (npaReportId) updateData.npaReportId = npaReportId;

    const [updated] = await db
      .update(reports)
      .set(updateData)
      .where(eq(reports.id, id))
      .returning();
    return updated;
  }

  async getReportStats() {
    return db
      .select({
        status: reports.status,
        complaintType: reports.complaintType,
        count: count(),
      })
      .from(reports)
      .groupBy(reports.status, reports.complaintType);
  }
}
