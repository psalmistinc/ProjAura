import { NextRequest, NextResponse } from 'next/server';
import { NpaClient } from '@/server/npa-integration/npa.client';

const npaClient = new NpaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'prices';

    switch (action) {
      case 'prices': {
        const prices = await npaClient.getLatestPrices();
        return NextResponse.json({
          success: true,
          data: prices,
          source: process.env.ENABLE_MOCKS === 'true' ? 'mock' : 'npa-website',
          timestamp: new Date().toISOString(),
        });
      }

      case 'stations': {
        const stations = await npaClient.getAllStations();
        return NextResponse.json({
          success: true,
          data: stations,
          source: process.env.ENABLE_MOCKS === 'true' ? 'mock' : 'npa-website',
          timestamp: new Date().toISOString(),
        });
      }

      case 'price-floors': {
        const floors = await npaClient.getPriceFloors();
        return NextResponse.json({
          success: true,
          data: floors,
          source: process.env.ENABLE_MOCKS === 'true' ? 'mock' : 'npa-website',
          timestamp: new Date().toISOString(),
        });
      }

      case 'build-up': {
        const buildUp = await npaClient.getPriceBuildUp();
        return NextResponse.json({
          success: true,
          data: buildUp,
          source: process.env.ENABLE_MOCKS === 'true' ? 'mock' : 'npa-website',
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: prices, stations, price-floors, build-up' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[NPA API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch NPA data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'sync-prices': {
        const prices = await npaClient.getLatestPrices();
        return NextResponse.json({
          success: true,
          message: `Synced ${prices.length} fuel prices`,
          data: prices,
          timestamp: new Date().toISOString(),
        });
      }

      case 'sync-stations': {
        const stations = await npaClient.getAllStations();
        return NextResponse.json({
          success: true,
          message: `Synced ${stations.length} stations`,
          data: stations,
          timestamp: new Date().toISOString(),
        });
      }

      case 'verify-cargo': {
        const { brvManifestId, fuelType, volumeLiters } = body;
        const result = await npaClient.verifyCargoDelivery({
          brvManifestId,
          fuelType,
          volumeLiters,
        });
        return NextResponse.json({ success: true, data: result });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action. Use: sync-prices, sync-stations, verify-cargo' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('[NPA API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'NPA sync failed' },
      { status: 500 }
    );
  }
}
