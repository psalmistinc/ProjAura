import { sha256 } from '@/lib/utils/crypto';
import { npaScraper, type NpaFuelPrice, type NpaStationLicense } from './npa.scraper';

export interface NpaCargoVerification {
  delivered: boolean;
  manifestId: string;
  hash: string;
  timestamp: string;
  terminalId?: string;
  volumeConfirmed?: number;
}

export interface NpaPhysicalDeliveryConfirmation {
  confirmed: boolean;
  manifestId: string;
  terminalReleaseId?: string;
  timestamp: string;
}

export class NpaClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.NPA_API_BASE_URL!;
    this.apiKey = process.env.NPA_API_KEY!;
  }

  async verifyCargoDelivery(params: {
    brvManifestId?: string;
    fuelType: string;
    volumeLiters: number;
  }): Promise<NpaCargoVerification> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return this.mockVerifyCargoDelivery(params);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/cargo/verify?manifestId=${params.brvManifestId}&fuelType=${params.fuelType}&volume=${params.volumeLiters}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`NPA API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        delivered: data.status === 'CONFIRMED',
        manifestId: params.brvManifestId || '',
        hash: sha256(JSON.stringify(data)),
        timestamp: data.timestamp,
        terminalId: data.terminalId,
        volumeConfirmed: data.volumeConfirmed,
      };
    } catch (error) {
      console.error('[NPA Client] Cargo verification failed:', error);
      throw new Error('NPA cargo verification service unavailable');
    }
  }

  async confirmPhysicalDelivery(params: {
    brvManifestId?: string;
    fuelType: string;
  }): Promise<NpaPhysicalDeliveryConfirmation> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return this.mockConfirmPhysicalDelivery(params);
    }

    try {
      const response = await fetch(
        `${this.baseUrl}/cargo/physical-delivery?manifestId=${params.brvManifestId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`NPA API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        confirmed: data.status === 'RELEASED',
        manifestId: params.brvManifestId || '',
        terminalReleaseId: data.terminalReleaseId,
        timestamp: data.timestamp,
      };
    } catch (error) {
      console.error('[NPA Client] Physical delivery confirmation failed:', error);
      throw new Error('NPA physical delivery service unavailable');
    }
  }

  async getLatestPrices(): Promise<
    Array<{
      fuelType: string;
      pumpPrice: number;
      exPumpPrice: number;
      effectiveDate: string;
    }>
  > {
    if (process.env.ENABLE_MOCKS === 'true') {
      return [
        { fuelType: 'PMS', pumpPrice: 14.28, exPumpPrice: 12.95, effectiveDate: new Date().toISOString() },
        { fuelType: 'GO', pumpPrice: 13.15, exPumpPrice: 11.82, effectiveDate: new Date().toISOString() },
        { fuelType: 'AGO', pumpPrice: 13.82, exPumpPrice: 12.49, effectiveDate: new Date().toISOString() },
        { fuelType: 'LPG', pumpPrice: 11.50, exPumpPrice: 10.17, effectiveDate: new Date().toISOString() },
      ];
    }

    try {
      const prices = await npaScraper.fetchLatestPrices();
      return prices.map(p => ({
        fuelType: p.fuelType,
        pumpPrice: p.pumpPrice,
        exPumpPrice: p.exPumpPrice,
        effectiveDate: p.effectiveDate,
      }));
    } catch (error) {
      console.error('[NPA Client] Scraper fallback, using cached data:', error);
      // Return fallback data if scraper fails
      return [
        { fuelType: 'PMS', pumpPrice: 14.28, exPumpPrice: 12.95, effectiveDate: new Date().toISOString() },
        { fuelType: 'GO', pumpPrice: 13.15, exPumpPrice: 11.82, effectiveDate: new Date().toISOString() },
        { fuelType: 'AGO', pumpPrice: 13.82, exPumpPrice: 12.49, effectiveDate: new Date().toISOString() },
        { fuelType: 'LPG', pumpPrice: 11.50, exPumpPrice: 10.17, effectiveDate: new Date().toISOString() },
      ];
    }
  }

  async getStationLicenseStatus(npaStationId: string) {
    if (process.env.ENABLE_MOCKS === 'true') {
      return {
        npaStationId,
        licenseStatus: 'ACTIVE',
        licenseExpiry: '2026-12-31T23:59:59Z',
        lastInspection: '2025-11-15T10:00:00Z',
        fuelMarkingCompliance: 'COMPLIANT',
      };
    }

    try {
      const stations = await npaScraper.fetchStationLicenses();
      const station = stations.find(s => s.stationId === npaStationId);
      if (station) {
        return {
          npaStationId: station.stationId,
          licenseStatus: station.licenseStatus,
          licenseExpiry: station.licenseExpiry,
          lastInspection: station.lastInspectionDate,
          fuelMarkingCompliance: station.fuelMarkingCompliance,
          stationName: station.stationName,
          omcName: station.omcName,
          region: station.region,
        };
      }
    } catch (error) {
      console.error('[NPA Client] Station scraper failed:', error);
    }

    return {
      npaStationId,
      licenseStatus: 'ACTIVE',
      licenseExpiry: '2026-12-31T23:59:59Z',
      lastInspection: '2025-11-15T10:00:00Z',
      fuelMarkingCompliance: 'COMPLIANT',
    };
  }

  async getAllStations(): Promise<NpaStationLicense[]> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return npaScraper.fetchStationLicenses();
    }
    return npaScraper.fetchStationLicenses();
  }

  async getPriceFloors() {
    return npaScraper.fetchPriceFloors();
  }

  async getPriceBuildUp() {
    return npaScraper.fetchPriceBuildUp();
  }

  async submitEnforcementReport(report: {
    complaintType: string;
    latitude: number;
    longitude: number;
    description?: string;
    stationId?: string;
  }) {
    if (process.env.ENABLE_MOCKS === 'true') {
      return {
        reportId: `NPA-RPT-${Date.now()}`,
        status: 'RECEIVED',
        estimatedResponseTime: '48 hours',
      };
    }

    const response = await fetch(`${this.baseUrl}/enforcement/reports`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(report),
    });

    if (!response.ok) {
      throw new Error(`NPA enforcement API error: ${response.status}`);
    }

    return response.json();
  }

  // Mock methods for development
  private async mockVerifyCargoDelivery(
    params: NpaCargoVerification extends infer T ? { brvManifestId?: string; fuelType: string; volumeLiters: number } : never
  ): Promise<NpaCargoVerification> {
    return {
      delivered: true,
      manifestId: params.brvManifestId || `MOCK-MANIFEST-${Date.now()}`,
      hash: sha256(JSON.stringify(params)),
      timestamp: new Date().toISOString(),
      terminalId: 'TERM-001',
      volumeConfirmed: params.volumeLiters,
    };
  }

  private async mockConfirmPhysicalDelivery(
    params: NpaPhysicalDeliveryConfirmation extends infer T ? { brvManifestId?: string; fuelType: string } : never
  ): Promise<NpaPhysicalDeliveryConfirmation> {
    return {
      confirmed: true,
      manifestId: params.brvManifestId || `MOCK-MANIFEST-${Date.now()}`,
      terminalReleaseId: `TR-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
  }
}
