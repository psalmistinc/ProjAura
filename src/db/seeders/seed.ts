import { db } from '../index';
import { claims } from '../schema/claims.sql';
import { claimAuditLog } from '../schema/audit.sql';
import { marketplaceAssets, bids, settlements } from '../schema/marketplace.sql';
import { fuelPrices, stations, reports } from '../schema/public-gateway.sql';

async function seed() {
  console.log('Seeding database...');

  // Seed fuel prices
  await db.insert(fuelPrices).values([
    { fuelType: 'PMS', pumpPriceGhs: '14.28', exPumpPriceGhs: '12.95', effectiveDate: new Date() },
    { fuelType: 'GO', pumpPriceGhs: '13.15', exPumpPriceGhs: '11.82', effectiveDate: new Date() },
    { fuelType: 'AGO', pumpPriceGhs: '13.82', exPumpPriceGhs: '12.49', effectiveDate: new Date() },
    { fuelType: 'LPG', pumpPriceGhs: '11.50', exPumpPriceGhs: '10.17', effectiveDate: new Date() },
  ]);

  // Seed sample stations
  await db.insert(stations).values([
    {
      npaStationId: 'STN-001',
      stationName: 'Goil Kaneshie',
      region: 'GREATER_ACCRA',
      district: 'Accra Metro',
      latitude: '5.5600',
      longitude: '-0.2300',
      licenseStatus: 'ACTIVE',
      fuelMarkingCompliance: 'COMPLIANT',
    },
    {
      npaStationId: 'STN-002',
      stationName: 'Total Osu',
      region: 'GREATER_ACCRA',
      district: 'Accra Metro',
      latitude: '5.5580',
      longitude: '-0.1780',
      licenseStatus: 'ACTIVE',
      fuelMarkingCompliance: 'COMPLIANT',
    },
    {
      npaStationId: 'STN-003',
      stationName: 'Zen Petroleum Tema',
      region: 'GREATER_ACCRA',
      district: 'Tema Metro',
      latitude: '5.6698',
      longitude: '-0.0166',
      licenseStatus: 'ACTIVE',
      fuelMarkingCompliance: 'PENDING',
    },
  ]);

  console.log('Seed complete.');
}

seed().catch(console.error);
