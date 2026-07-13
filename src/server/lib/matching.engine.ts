import { MarketplaceRepository } from '../marketplace/marketplace.repository';
import { FabricClient } from './fabric';
import { NotificationService } from './notifications';

export interface MatchResult {
  assetId: string;
  bidId: string;
  bidderOrgId: string;
  claimantOrgId: string;
  discountRate: number;
  settlementAmount: number;
  discountAmount: number;
  fundedAmount: number;
  fabricTxId?: string;
}

export class MatchingEngine {
  constructor(
    private readonly marketplaceRepo: MarketplaceRepository,
    private readonly fabricClient: FabricClient,
    private readonly notifications: NotificationService
  ) {}

  async processBid(
    assetId: string,
    bidderOrgId: string,
    discountRate: number,
    fundedAmount: number,
    tenorDays: number
  ): Promise<MatchResult | null> {
    // 1. Validate asset is in BIDDING_ACTIVE or LISTED status
    const asset = await this.marketplaceRepo.findAssetById(assetId);
    if (!asset) throw new Error('Asset not found');
    if (!['LISTED', 'BIDDING_ACTIVE'].includes(asset.assetStatus)) {
      throw new Error('Asset not available for bidding');
    }

    // 2. Validate discount rate bounds
    if (discountRate < 0.005 || discountRate > 0.15) {
      throw new Error('Discount rate must be between 0.5% and 15%');
    }

    // 3. Check if this is the best bid
    const bestBid = await this.marketplaceRepo.findBestBidForAsset(assetId);

    // 4. If no existing bids or this is better, execute match
    if (!bestBid || discountRate <= parseFloat(bestBid.discountRate)) {
      const match = await this.executeMatch(asset, {
        bidId: bestBid?.id || '',
        bidderOrgId: bestBid?.bidderOrgId || bidderOrgId,
        discountRate: bestBid
          ? parseFloat(bestBid.discountRate)
          : discountRate,
        fundedAmount: bestBid
          ? parseFloat(bestBid.fundedAmountGhs)
          : fundedAmount,
        tenorDays: bestBid?.tenorDays || tenorDays,
      });

      return match;
    }

    // 5. Queue bid (not best yet)
    return null;
  }

  private async executeMatch(
    asset: {
      id: string;
      faceValueGhs: string;
      claimantOrgId: string;
    },
    bestBid: {
      bidId: string;
      bidderOrgId: string;
      discountRate: number;
      fundedAmount: number;
      tenorDays: number;
    }
  ): Promise<MatchResult> {
    const faceValue = parseFloat(asset.faceValueGhs);
    const discount =
      faceValue * bestBid.discountRate * (bestBid.tenorDays / 365);
    const settlementAmount = faceValue - discount;

    // 1. Create settlement
    const settlement = await this.marketplaceRepo.createSettlement({
      assetId: asset.id,
      winningBidId: bestBid.bidId,
      claimantOrgId: asset.claimantOrgId,
      bidderOrgId: bestBid.bidderOrgId,
      settlementAmount: settlementAmount.toFixed(2),
      discountAmount: discount.toFixed(2),
      fundedAmountGhs: bestBid.fundedAmount.toFixed(2),
    });

    // 2. Update asset status
    await this.marketplaceRepo.updateAssetStatus(asset.id, 'MATCHED');

    // 3. Anchor to Fabric
    const fabricTxId = await this.fabricClient.logSettlement({
      assetId: asset.id,
      settlementId: settlement.id,
      amount: settlementAmount,
      fromOrg: bestBid.bidderOrgId,
      toOrg: asset.claimantOrgId,
    });

    // 4. Notify both parties
    await this.notifications.send({
      type: 'SETTLEMENT_INITIATED',
      assetId: asset.id,
      orgId: asset.claimantOrgId,
      metadata: { settlementId: settlement.id, amount: settlementAmount },
    });

    return {
      assetId: asset.id,
      bidId: bestBid.bidId,
      bidderOrgId: bestBid.bidderOrgId,
      claimantOrgId: asset.claimantOrgId,
      discountRate: bestBid.discountRate,
      settlementAmount,
      discountAmount: discount,
      fundedAmount: bestBid.fundedAmount,
      fabricTxId,
    };
  }
}
