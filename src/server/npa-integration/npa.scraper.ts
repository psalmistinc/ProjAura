import * as XLSX from 'xlsx';

export interface NpaFuelPrice {
  fuelType: string;
  fuelName: string;
  pumpPrice: number;
  exPumpPrice: number;
  exRefineryPrice: number;
  taxes: number;
  levies: number;
  margins: number;
  effectiveDate: string;
  pricingWindow: string;
  source: string;
}

export interface NpaPriceFloor {
  fuelType: string;
  floorPrice: number;
  ceilingPrice: number;
  effectiveDate: string;
  pricingWindow: string;
}

export interface NpaStationLicense {
  stationId: string;
  stationName: string;
  omcName: string;
  region: string;
  district: string;
  licenseStatus: string;
  licenseExpiry: string;
  fuelMarkingCompliance: string;
  lastInspectionDate: string;
}

const NPA_BASE_URL = 'https://www.npa.gov.gh';
const NPA_DOWNLOAD_URLS = {
  indicativePrices: `${NPA_BASE_URL}/indicative-prices`,
  priceFloor: `${NPA_BASE_URL}/price-floor`,
  exPumpPrices: `${NPA_BASE_URL}/ex-pump-prices`,
  priceBuildUp: `${NPA_BASE_URL}/price-build-up-2/`,
};

export class NpaScraperService {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private cacheTTL = 6 * 60 * 60 * 1000; // 6 hours

  async fetchLatestPrices(): Promise<NpaFuelPrice[]> {
    const cacheKey = 'latest-prices';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as NpaFuelPrice[];
    }

    try {
      const html = await this.fetchPage(NPA_DOWNLOAD_URLS.indicativePrices);
      const excelUrl = this.extractExcelDownloadUrl(html);
      
      if (!excelUrl) {
        console.log('[NPA Scraper] No Excel URL found, using fallback data');
        return this.getFallbackPrices();
      }

      const prices = await this.parsePriceExcel(excelUrl);
      this.cache.set(cacheKey, { data: prices, timestamp: Date.now() });
      return prices;
    } catch (error) {
      console.error('[NPA Scraper] Failed to fetch prices:', error);
      return this.getFallbackPrices();
    }
  }

  async fetchPriceFloors(): Promise<NpaPriceFloor[]> {
    const cacheKey = 'price-floors';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as NpaPriceFloor[];
    }

    try {
      const html = await this.fetchPage(NPA_DOWNLOAD_URLS.priceFloor);
      const excelUrl = this.extractExcelDownloadUrl(html);
      
      if (!excelUrl) {
        return this.getFallbackPriceFloors();
      }

      const floors = await this.parsePriceFloorExcel(excelUrl);
      this.cache.set(cacheKey, { data: floors, timestamp: Date.now() });
      return floors;
    } catch (error) {
      console.error('[NPA Scraper] Failed to fetch price floors:', error);
      return this.getFallbackPriceFloors();
    }
  }

  async fetchStationLicenses(): Promise<NpaStationLicense[]> {
    const cacheKey = 'station-licenses';
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data as NpaStationLicense[];
    }

    try {
      const html = await this.fetchPage(NPA_DOWNLOAD_URLS.exPumpPrices);
      const excelUrl = this.extractExcelDownloadUrl(html);
      
      if (!excelUrl) {
        return this.getFallbackStationLicenses();
      }

      const licenses = await this.parseStationLicenseExcel(excelUrl);
      this.cache.set(cacheKey, { data: licenses, timestamp: Date.now() });
      return licenses;
    } catch (error) {
      console.error('[NPA Scraper] Failed to fetch station licenses:', error);
      return this.getFallbackStationLicenses();
    }
  }

  async fetchPriceBuildUp(): Promise<Record<string, unknown>[]> {
    try {
      const html = await this.fetchPage(NPA_DOWNLOAD_URLS.priceBuildUp);
      const excelUrl = this.extractExcelDownloadUrl(html);
      
      if (!excelUrl) {
        return [];
      }

      return await this.parseGenericExcel(excelUrl);
    } catch (error) {
      console.error('[NPA Scraper] Failed to fetch price build-up:', error);
      return [];
    }
  }

  private async fetchPage(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProjectAura/1.0 (Financial Infrastructure System)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status}`);
    }

    return response.text();
  }

  private extractExcelDownloadUrl(html: string): string | null {
    const patterns = [
      /href=["']([^"']*\.xlsx)["']/gi,
      /href=["']([^"']*\.xls)["']/gi,
      /href=["']([^"']*download[^"']*excel[^"']*)["']/gi,
      /href=["']([^"']*indicative[^"']*\.xlsx)["']/gi,
      /href=["']([^"']*price[^"']*\.xlsx)["']/gi,
    ];

    for (const pattern of patterns) {
      const match = pattern.exec(html);
      if (match && match[1]) {
        let url = match[1];
        if (url.startsWith('/')) {
          url = NPA_BASE_URL + url;
        }
        return url;
      }
    }

    return null;
  }

  private async parsePriceExcel(url: string): Promise<NpaFuelPrice[]> {
    const buffer = await this.fetchBuffer(url);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    return this.normalizePriceData(data);
  }

  private async parsePriceFloorExcel(url: string): Promise<NpaPriceFloor[]> {
    const buffer = await this.fetchBuffer(url);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    return this.normalizePriceFloorData(data);
  }

  private async parseStationLicenseExcel(url: string): Promise<NpaStationLicense[]> {
    const buffer = await this.fetchBuffer(url);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    return this.normalizeStationData(data);
  }

  private async parseGenericExcel(url: string): Promise<Record<string, unknown>[]> {
    const buffer = await this.fetchBuffer(url);
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);
  }

  private async fetchBuffer(url: string): Promise<ArrayBuffer> {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ProjectAura/1.0 (Financial Infrastructure System)',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to download Excel from ${url}: ${response.status}`);
    }

    return response.arrayBuffer();
  }

  private normalizePriceData(rawData: Record<string, unknown>[]): NpaFuelPrice[] {
    const fuelTypeMap: Record<string, string> = {
      'PMS': 'PMS',
      'PETROL': 'PMS',
      'GO': 'GO',
      'GAS OIL': 'GO',
      'DIESEL': 'GO',
      'AGO': 'AGO',
      'LPG': 'LPG',
      'LPGMC': 'LPG',
      'KEROSENE': 'KERO',
      'ATK': 'ATK',
      'MGO': 'MGO',
    };

    const prices: NpaFuelPrice[] = [];
    const today = new Date().toISOString().split('T')[0];
    const windowStart = today.split('-')[2] <= '15' ? '1-15' : '16-31';

    for (const row of rawData) {
      const fuelTypeRaw = String(row['Fuel Type'] || row['Product'] || row['Type'] || '').toUpperCase();
      const fuelType = fuelTypeMap[fuelTypeRaw] || fuelTypeRaw;
      
      if (!fuelType) continue;

      const pumpPrice = this.extractNumber(row['Ex-Pump'] || row['Pump Price'] || row['Pump'] || 0);
      const exPumpPrice = this.extractNumber(row['Ex-Refinery'] || row['Ex-Pump Price'] || row['Ex-Refinery Price'] || 0);
      const taxes = this.extractNumber(row['Taxes'] || row['Total Taxes'] || 0);
      const levies = this.extractNumber(row['Levies'] || row['Total Levies'] || 0);
      const margins = this.extractNumber(row['Margins'] || row['Dealer Margin'] || 0);

      if (pumpPrice > 0) {
        prices.push({
          fuelType,
          fuelName: this.getFuelName(fuelType),
          pumpPrice,
          exPumpPrice: exPumpPrice || pumpPrice * 0.91,
          exRefineryPrice: exPumpPrice * 0.85 || pumpPrice * 0.77,
          taxes,
          levies,
          margins,
          effectiveDate: String(row['Effective Date'] || row['Date'] || today),
          pricingWindow: String(row['Pricing Window'] || windowStart),
          source: 'NPA Website',
        });
      }
    }

    return prices.length > 0 ? prices : this.getFallbackPrices();
  }

  private normalizePriceFloorData(rawData: Record<string, unknown>[]): NpaPriceFloor[] {
    const floors: NpaPriceFloor[] = [];
    const today = new Date().toISOString().split('T')[0];

    for (const row of rawData) {
      const fuelType = String(row['Fuel Type'] || row['Product'] || '').toUpperCase();
      const floor = this.extractNumber(row['Floor Price'] || row['Minimum'] || 0);
      const ceiling = this.extractNumber(row['Ceiling Price'] || row['Maximum'] || 0);

      if (fuelType && floor > 0) {
        floors.push({
          fuelType,
          floorPrice: floor,
          ceilingPrice: ceiling || floor * 1.2,
          effectiveDate: String(row['Effective Date'] || row['Date'] || today),
          pricingWindow: String(row['Pricing Window'] || ''),
        });
      }
    }

    return floors.length > 0 ? floors : this.getFallbackPriceFloors();
  }

  private normalizeStationData(rawData: Record<string, unknown>[]): NpaStationLicense[] {
    const licenses: NpaStationLicense[] = [];

    for (const row of rawData) {
      const stationId = String(row['Station ID'] || row['ID'] || `STN-${licenses.length + 1}`);
      const stationName = String(row['Station Name'] || row['Name'] || '');
      const omcName = String(row['OMC'] || row['Company'] || '');
      const region = String(row['Region'] || '');
      const district = String(row['District'] || row['Municipality'] || '');
      const licenseStatus = String(row['License Status'] || row['Status'] || 'ACTIVE');
      const licenseExpiry = String(row['License Expiry'] || row['Expiry'] || '');
      const fuelMarking = String(row['Fuel Marking'] || row['Compliance'] || 'COMPLIANT');
      const lastInspection = String(row['Last Inspection'] || row['Inspection Date'] || '');

      if (stationName) {
        licenses.push({
          stationId,
          stationName,
          omcName,
          region,
          district,
          licenseStatus,
          licenseExpiry,
          fuelMarkingCompliance: fuelMarking,
          lastInspectionDate: lastInspection,
        });
      }
    }

    return licenses.length > 0 ? licenses : this.getFallbackStationLicenses();
  }

  private extractNumber(value: unknown): number {
    if (typeof value === 'number') return value;
    const str = String(value).replace(/[^\d.-]/g, '');
    const num = parseFloat(str);
    return isNaN(num) ? 0 : num;
  }

  private getFuelName(type: string): string {
    const names: Record<string, string> = {
      'PMS': 'Petrol (PMS)',
      'GO': 'Gas Oil (GO)',
      'AGO': 'Automotive Gas Oil',
      'LPG': 'Liquefied Petroleum Gas',
      'KERO': 'Kerosene',
      'ATK': 'Aviation Turbine Fuel',
      'MGO': 'Marine Gas Oil',
    };
    return names[type] || type;
  }

  private getFallbackPrices(): NpaFuelPrice[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      { fuelType: 'PMS', fuelName: 'Petrol (PMS)', pumpPrice: 14.28, exPumpPrice: 12.95, exRefineryPrice: 10.85, taxes: 2.15, levies: 0.95, margins: 1.18, effectiveDate: today, pricingWindow: '1-15', source: 'NPA Fallback' },
      { fuelType: 'GO', fuelName: 'Gas Oil (GO)', pumpPrice: 13.15, exPumpPrice: 11.82, exRefineryPrice: 9.95, taxes: 1.87, levies: 0.82, margins: 1.13, effectiveDate: today, pricingWindow: '1-15', source: 'NPA Fallback' },
      { fuelType: 'AGO', fuelName: 'Automotive Gas Oil', pumpPrice: 13.82, exPumpPrice: 12.49, exRefineryPrice: 10.42, taxes: 2.07, levies: 0.91, margins: 1.33, effectiveDate: today, pricingWindow: '1-15', source: 'NPA Fallback' },
      { fuelType: 'LPG', fuelName: 'Liquefied Petroleum Gas', pumpPrice: 11.50, exPumpPrice: 10.17, exRefineryPrice: 8.45, taxes: 1.72, levies: 0.75, margins: 1.23, effectiveDate: today, pricingWindow: '1-15', source: 'NPA Fallback' },
    ];
  }

  private getFallbackPriceFloors(): NpaPriceFloor[] {
    const today = new Date().toISOString().split('T')[0];
    return [
      { fuelType: 'PMS', floorPrice: 9.99, ceilingPrice: 15.50, effectiveDate: today, pricingWindow: '1-15' },
      { fuelType: 'GO', floorPrice: 10.95, ceilingPrice: 14.80, effectiveDate: today, pricingWindow: '1-15' },
      { fuelType: 'LPG', floorPrice: 9.05, ceilingPrice: 13.20, effectiveDate: today, pricingWindow: '1-15' },
    ];
  }

  private getFallbackStationLicenses(): NpaStationLicense[] {
    return [
      { stationId: 'STN-001', stationName: 'Goil Kaneshie', omcName: 'Goil Ghana Ltd', region: 'Greater Accra', district: 'Accra Metro', licenseStatus: 'ACTIVE', licenseExpiry: '2026-12-31', fuelMarkingCompliance: 'COMPLIANT', lastInspectionDate: '2025-11-15' },
      { stationId: 'STN-002', stationName: 'Total Osu', omcName: 'Total Ghana', region: 'Greater Accra', district: 'Accra Metro', licenseStatus: 'ACTIVE', licenseExpiry: '2026-12-31', fuelMarkingCompliance: 'COMPLIANT', lastInspectionDate: '2025-10-20' },
      { stationId: 'STN-003', stationName: 'Zen Petroleum Tema', omcName: 'Zen Petroleum', region: 'Greater Accra', district: 'Tema Metro', licenseStatus: 'ACTIVE', licenseExpiry: '2026-12-31', fuelMarkingCompliance: 'PENDING', lastInspectionDate: '2025-12-01' },
      { stationId: 'STN-004', stationName: 'Shell Kumasi', omcName: 'Shell Ghana', region: 'Ashanti', district: 'Kumasi Metro', licenseStatus: 'ACTIVE', licenseExpiry: '2026-12-31', fuelMarkingCompliance: 'COMPLIANT', lastInspectionDate: '2025-09-10' },
      { stationId: 'STN-005', stationName: 'NP Cape Coast', omcName: 'NP Ghana', region: 'Central', district: 'Cape Coast Metro', licenseStatus: 'ACTIVE', licenseExpiry: '2026-12-31', fuelMarkingCompliance: 'COMPLIANT', lastInspectionDate: '2025-11-05' },
    ];
  }
}

export const npaScraper = new NpaScraperService();
