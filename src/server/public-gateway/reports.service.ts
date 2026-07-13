import { ReportsRepository } from './reports.repository';
import { NpaClient } from '../npa-integration/npa.client';
import type { PriceQuery, StationQuery, ReportQuery, ReportSubmission } from '@/lib/schemas/public-gateway';

export class ReportError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ReportError';
  }
}

export class ReportsService {
  constructor(
    private readonly repo: ReportsRepository,
    private readonly npaClient: NpaClient
  ) {}

  async getCurrentPrices(_query: PriceQuery) {
    return this.repo.getAllCurrentPrices();
  }

  async syncPricesFromNpa() {
    const npaPrices = await this.npaClient.getLatestPrices();
    const results = [];

    for (const price of npaPrices) {
      const created = await this.repo.createFuelPrice({
        fuelType: price.fuelType,
        pumpPriceGhs: price.pumpPrice.toString(),
        exPumpPriceGhs: price.exPumpPrice.toString(),
        effectiveDate: new Date(price.effectiveDate),
        source: 'NPA',
      });
      results.push(created);
    }

    return results;
  }

  async getStationLicenseStatus(stationId: string) {
    const station = await this.repo.findStationById(stationId);
    if (!station) throw new ReportError('STATION_NOT_FOUND', 'Station not found');
    return station;
  }

  async checkStationByNpaId(npaStationId: string) {
    const station = await this.repo.findStationByNpaId(npaStationId);
    if (!station) throw new ReportError('STATION_NOT_FOUND', 'Station not found');

    const npaStatus = await this.npaClient.getStationLicenseStatus(npaStationId);
    return { ...station, npaStatus };
  }

  async searchStations(query: StationQuery) {
    return this.repo.findManyStations(query);
  }

  async submitReport(data: ReportSubmission) {
    const nearbyReports = await this.repo.findNearbyReports(
      data.latitude,
      data.longitude,
      500,
      data.complaintType
    );

    const isDuplicate = nearbyReports.length > 0;
    const priority = this.calculatePriority(data.complaintType, nearbyReports.length);

    const report = await this.repo.createReport(data);

    try {
      const npaResult = await this.npaClient.submitEnforcementReport({
        complaintType: data.complaintType,
        latitude: data.latitude,
        longitude: data.longitude,
        description: data.description,
        stationId: data.stationId,
      });

      if (npaResult.reportId) {
        await this.repo.updateReportStatus(report.id, 'FORWARDED_TO_NPA', npaResult.reportId);
      }
    } catch (error) {
      console.error('[ReportsService] Failed to forward to NPA:', error);
    }

    return { ...report, isDuplicate, priority };
  }

  async getReports(query: ReportQuery) {
    return this.repo.findManyReports(query);
  }

  async getReportStats() {
    return this.repo.getReportStats();
  }

  private calculatePriority(complaintType: string, nearbyCount: number): number {
    let base = 50;
    switch (complaintType) {
      case 'FUEL_ADULTERATION': base = 80; break;
      case 'SHORT_DISPENSING': base = 60; break;
      case 'PRICE_GOUGING': base = 55; break;
      case 'UNLICENSED_SALE': base = 70; break;
    }
    return Math.min(100, base + nearbyCount * 5);
  }
}
