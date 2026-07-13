import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { settlements, marketplaceAssets } from '@/db/schema/marketplace.sql';
import { claims } from '@/db/schema/claims.sql';
import { eq } from 'drizzle-orm';
import { verifySignature } from '@/lib/utils/crypto';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-rtgs-signature');
  const body = await request.text();

  if (!signature || !verifySignature(body, signature, process.env.RTGS_API_KEY!)) {
    return NextResponse.json(
      { data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid webhook signature' } },
      { status: 401 }
    );
  }

  try {
    const payload = JSON.parse(body);

    if (payload.event === 'TRANSFER_CONFIRMED') {
      const settlement = await db.query.settlements.findFirst({
        where: eq(settlements.id, payload.settlementId),
      });

      if (settlement) {
        await db
          .update(settlements)
          .set({
            status: 'CONFIRMED',
            rtgsReference: payload.transactionId,
            settledAt: new Date(),
          })
          .where(eq(settlements.id, settlement.id));

        // Mark the underlying claim as paid
        const asset = await db.query.marketplaceAssets.findFirst({
          where: eq(marketplaceAssets.id, settlement.assetId),
        });

        if (asset) {
          await db
            .update(claims)
            .set({ status: 'PAID', updatedAt: new Date() })
            .where(eq(claims.id, asset.claimId));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('[RTGS Webhook] Processing error:', error);
    return NextResponse.json(
      { data: null, error: { code: 'WEBHOOK_ERROR', message: 'Failed to process webhook' } },
      { status: 500 }
    );
  }
}