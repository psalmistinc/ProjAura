import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { fuelPrices, stations } from '@/db/schema/public-gateway.sql';
import { eq } from 'drizzle-orm';
import { verifySignature } from '@/lib/utils/crypto';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-npa-signature');
  const body = await request.text();

  if (!signature || !verifySignature(body, signature, process.env.NPA_WEBHOOK_SECRET!)) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid webhook signature' } },
      { status: 401 }
    );
  }

  try {
    const payload = JSON.parse(body);

    switch (payload.event) {
      case 'PRICE_UPDATE':
        for (const price of payload.prices) {
          await db.insert(fuelPrices).values({
            fuelType: price.fuelType,
            pumpPriceGhs: price.pumpPrice.toString(),
            exPumpPriceGhs: price.exPumpPrice.toString(),
            effectiveDate: new Date(price.effectiveDate),
            source: 'NPA_WEBHOOK',
          });
        }
        break;

      case 'STATION_LICENSE_UPDATE':
        await db
          .update(stations)
          .set({
            licenseStatus: payload.licenseStatus,
            licenseExpiry: new Date(payload.licenseExpiry),
            updatedAt: new Date(),
          })
          .where(
            // @ts-ignore
            eq(stations.npaStationId, payload.npaStationId)
          );
        break;

      default:
        console.log('[NPA Webhook] Unknown event:', payload.event);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[NPA Webhook] Processing error:', error);
    return NextResponse.json(
      { data: null, error: { code: 'WEBHOOK_ERROR', message: 'Failed to process webhook' } },
      { status: 500 }
    );
  }
}