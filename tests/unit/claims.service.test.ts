import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClaimsService, ClaimError } from '@/server/claims/claims.service';

describe('ClaimsService', () => {
  let service: ClaimsService;
  let mockRepo: any;
  let mockNpaClient: any;
  let mockFabricClient: any;

  beforeEach(() => {
    mockRepo = {
      findByNpaReference: vi.fn(),
      create: vi.fn(),
      findById: vi.fn(),
      updateStatus: vi.fn(),
      findMany: vi.fn(),
      getAuditLog: vi.fn(),
      getStats: vi.fn(),
    };
    mockNpaClient = {
      verifyCargoDelivery: vi.fn(),
      confirmPhysicalDelivery: vi.fn(),
    };
    mockFabricClient = {
      logClaim: vi.fn(),
      logVerifiedClaim: vi.fn(),
      logSettlement: vi.fn(),
    };
    service = new ClaimsService(mockRepo, mockNpaClient, mockFabricClient);
  });

  describe('submitClaim', () => {
    it('should reject duplicate NPA references', async () => {
      mockRepo.findByNpaReference.mockResolvedValue({ id: 'existing' });

      await expect(
        service.submitClaim(
          { npaReference: 'NPA-001', claimType: 'UPPF', fuelType: 'PMS', volumeLiters: 50000, claimedAmountGhs: 750000 } as any,
          'org-1'
        )
      ).rejects.toThrow(ClaimError);
    });

    it('should reject claims not verified by NPA', async () => {
      mockRepo.findByNpaReference.mockResolvedValue(null);
      mockNpaClient.verifyCargoDelivery.mockResolvedValue({ delivered: false });

      await expect(
        service.submitClaim(
          { npaReference: 'NPA-001', claimType: 'UPPF', fuelType: 'PMS', volumeLiters: 50000, claimedAmountGhs: 750000 } as any,
          'org-1'
        )
      ).rejects.toThrow(ClaimError);
    });

    it('should create claim and anchor to Fabric on success', async () => {
      mockRepo.findByNpaReference.mockResolvedValue(null);
      mockNpaClient.verifyCargoDelivery.mockResolvedValue({
        delivered: true,
        hash: 'abc123',
        manifestId: 'NPA-001',
        timestamp: new Date().toISOString(),
      });
      mockRepo.create.mockResolvedValue({ id: 'claim-1', status: 'SUBMITTED', claimType: 'UPPF', claimedAmountGhs: '750000' });
      mockFabricClient.logClaim.mockResolvedValue('tx-001');
      mockRepo.updateStatus.mockResolvedValue({ id: 'claim-1', status: 'NPA_DATA_CROSSED' });

      const claim = await service.submitClaim(
        { npaReference: 'NPA-001', claimType: 'UPPF', fuelType: 'PMS', volumeLiters: 50000, claimedAmountGhs: 750000 } as any,
        'org-1'
      );

      expect(claim.id).toBe('claim-1');
      expect(mockRepo.updateStatus).toHaveBeenCalledWith(
        'claim-1',
        'NPA_DATA_CROSSED',
        'org-1',
        'SYSTEM',
        expect.objectContaining({ fabricTxId: 'tx-001' })
      );
    });
  });

  describe('verifyPhysicalDelivery', () => {
    it('should throw if claim not found', async () => {
      mockRepo.findById.mockResolvedValue(null);
      await expect(service.verifyPhysicalDelivery('id-1', 'actor-1')).rejects.toThrow(ClaimError);
    });

    it('should throw if claim is not in NPA_DATA_CROSSED status', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'id-1', status: 'SUBMITTED' });
      await expect(service.verifyPhysicalDelivery('id-1', 'actor-1')).rejects.toThrow(ClaimError);
    });

    it('should update status on successful delivery confirmation', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'id-1', status: 'NPA_DATA_CROSSED', brvManifestId: 'BRV-001', fuelType: 'PMS' });
      mockNpaClient.confirmPhysicalDelivery.mockResolvedValue({ confirmed: true, manifestId: 'BRV-001', timestamp: new Date().toISOString() });
      mockRepo.updateStatus.mockResolvedValue({ id: 'id-1', status: 'PHYSICAL_DELIVERY_CONFIRMED' });

      const result = await service.verifyPhysicalDelivery('id-1', 'actor-1');
      expect(result.status).toBe('PHYSICAL_DELIVERY_CONFIRMED');
    });
  });

  describe('activateSLA', () => {
    it('should throw if claim not in PHYSICAL_DELIVERY_CONFIRMED status', async () => {
      mockRepo.findById.mockResolvedValue({ id: 'id-1', status: 'SUBMITTED' });
      await expect(service.activateSLA('id-1')).rejects.toThrow(ClaimError);
    });

    it('should activate SLA and anchor to Fabric', async () => {
      mockRepo.findById.mockResolvedValue({
        id: 'id-1',
        status: 'PHYSICAL_DELIVERY_CONFIRMED',
        claimType: 'UPPF',
        claimedAmountGhs: '750000',
      });
      mockFabricClient.logVerifiedClaim.mockResolvedValue('tx-002');
      mockRepo.updateStatus.mockResolvedValue({ id: 'id-1', status: 'VERIFIED_LOGGED' });

      const result = await service.activateSLA('id-1');
      expect(result.status).toBe('VERIFIED_LOGGED');
      expect(mockFabricClient.logVerifiedClaim).toHaveBeenCalled();
    });
  });

  describe('getClaims', () => {
    it('should delegate to repository', async () => {
      mockRepo.findMany.mockResolvedValue({ data: [], count: 0, page: 1, limit: 20, totalPages: 0 });
      const result = await service.getClaims({ page: 1, limit: 20, sortBy: 'created_at', sortOrder: 'desc' });
      expect(result.data).toEqual([]);
    });
  });
});
