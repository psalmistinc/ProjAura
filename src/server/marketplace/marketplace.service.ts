import { MarketplaceRepository } from './marketplace.repository';
import { MatchingEngine } from '../lib/matching.engine';
import { FabricClient } from '../lib/fabric';
import { NotificationService } from '../lib/notifications';
import { ClaimsRepository } from '../claims/claims.repository';
import type { BidSubmission, AssetQuery, BidQuery } from '@/lib/schemas/marketplace';

export class MarketplaceError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'MarketplaceError';
  }
}

export class MarketplaceService {
  private readonly matchingEngine: MatchingEngine;
  private readonly notifications: NotificationService;

  constructor(
    private readonly repo: MarketplaceRepository,
    private readonly claimsRepo: ClaimsRepository,
    private readonly fabricClient: FabricClient
  ) {
    this.notifications = new NotificationService();
    this.matchingEngine = new MatchingEngine(repo, fabricClient, this.notifications);
  }

  async listClaimOnMarketplace(claimId: string) {
    const claim = await this.claimsRepo.findById(claimId);
    if (!claim) throw new MarketplaceError('CLAIM_NOT_FOUND', 'Claim does not exist');
    if (claim.status !== 'VERIFIED_LOGGED') {
      throw new MarketplaceError('CLAIM_NOT_VERIFIED', 'Claim must be verified to list');
    }

    const existingAsset = await this.repo.findAssetById(claimId);
    if (existingAsset) {
      throw new MarketplaceError('ALREADY_LISTED', 'Claim is already listed on marketplace');
    }

    const asset = await this.repo.createAsset({
      claimId: claim.id,
      faceValueGhs: claim.claimedAmountGhs,
      fuelType: claim.fuelType,
      claimantOrgId: claim.claimantOrgId,
      maturityDate: claim.slaDeadline
        ? new Date(claim.slaDeadline).toISOString().slice(0, 10)
        : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });

    await this.repo.updateAssetStatus(asset.id, 'BIDDING_ACTIVE');

    return asset;
  }

  async submitBid(data: BidSubmission, bidderOrgId: string) {
    const asset = await this.repo.findAssetById(data.assetId);
    if (!asset) throw new MarketplaceError('ASSET_NOT_FOUND', 'Asset does not exist');
    if (!['LISTED', 'BIDDING_ACTIVE'].includes(asset.assetStatus)) {
      throw new MarketplaceError('ASSET_NOT_AVAILABLE', 'Asset is not accepting bids');
    }

    const bid = await this.repo.createBid(data, bidderOrgId);

    const matchResult = await this.matchingEngine.processBid(
      data.assetId,
      bidderOrgId,
      data.discountRate,
      data.fundedAmountGhs,
      data.tenorDays
    );

    if (matchResult) {
      await this.notifications.send({
        type: 'SETTLEMENT_INITIATED',
        assetId: data.assetId,
        orgId: asset.claimantOrgId,
        metadata: { settlementId: matchResult.assetId, amount: matchResult.settlementAmount },
      });
    }

    return { bid, matched: !!matchResult, matchResult };
  }

  async getAssets(query: AssetQuery) {
    return this.repo.findManyAssets(query);
  }

  async getAssetById(id: string) {
    const asset = await this.repo.findAssetById(id);
    if (!asset) throw new MarketplaceError('ASSET_NOT_FOUND', 'Asset does not exist');
    return asset;
  }

  async getBids(query: BidQuery) {
    return this.repo.findManyBids(query);
  }

  async getSettlementStats() {
    return this.repo.getSettlementStats();
  }

  async expireStaleBids() {
    return this.repo.expireStaleBids();
  }
}
