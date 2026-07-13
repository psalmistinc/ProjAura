import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MatchingEngine } from '@/server/lib/matching.engine';

describe('MatchingEngine', () => {
  let engine: MatchingEngine;
  let mockMarketplaceRepo: any;
  let mockFabricClient: any;
  let mockNotifications: any;

  beforeEach(() => {
    mockMarketplaceRepo = {
      findAssetById: vi.fn(),
      findBestBidForAsset: vi.fn(),
      createSettlement: vi.fn(),
      updateAssetStatus: vi.fn(),
    };
    mockFabricClient = {
      logSettlement: vi.fn(),
    };
    mockNotifications = {
      send: vi.fn(),
    };
    engine = new MatchingEngine(mockMarketplaceRepo, mockFabricClient, mockNotifications);
  });

  it('should throw if asset not found', async () => {
    mockMarketplaceRepo.findAssetById.mockResolvedValue(null);
    await expect(
      engine.processBid('asset-1', 'bank-1', 0.02, 1000000, 30)
    ).rejects.toThrow('Asset not found');
  });

  it('should throw if asset not in listing/bidding status', async () => {
    mockMarketplaceRepo.findAssetById.mockResolvedValue({
      id: 'asset-1',
      assetStatus: 'SETTLED',
    });
    await expect(
      engine.processBid('asset-1', 'bank-1', 0.02, 1000000, 30)
    ).rejects.toThrow('Asset not available');
  });

  it('should throw if discount rate out of bounds', async () => {
    mockMarketplaceRepo.findAssetById.mockResolvedValue({
      id: 'asset-1',
      assetStatus: 'BIDDING_ACTIVE',
    });
    await expect(
      engine.processBid('asset-1', 'bank-1', 0.001, 1000000, 30)
    ).rejects.toThrow('Discount rate must be between');
  });

  it('should execute match when no existing bids', async () => {
    mockMarketplaceRepo.findAssetById.mockResolvedValue({
      id: 'asset-1',
      assetStatus: 'BIDDING_ACTIVE',
      faceValueGhs: '1000000',
      claimantOrgId: 'omc-1',
    });
    mockMarketplaceRepo.findBestBidForAsset.mockResolvedValue(null);
    mockMarketplaceRepo.createSettlement.mockResolvedValue({ id: 'settlement-1' });
    mockFabricClient.logSettlement.mockResolvedValue('tx-001');

    const result = await engine.processBid('asset-1', 'bank-1', 0.02, 1000000, 30);

    expect(result).not.toBeNull();
    expect(result!.discountRate).toBe(0.02);
    expect(result!.settlementAmount).toBeLessThan(1000000);
  });
});
