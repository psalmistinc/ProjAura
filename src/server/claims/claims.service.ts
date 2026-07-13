import { ClaimsRepository } from './claims.repository';
import { NpaClient } from '../npa-integration/npa.client';
import { FabricClient } from '../lib/fabric';
import { SlaEngine } from '../lib/sla.engine';
import { NotificationService } from '../lib/notifications';
import type { ClaimSubmission, ClaimQuery } from '@/lib/schemas/claims';

export class ClaimError extends Error {
  constructor(
    public readonly code: string,
    message: string
  ) {
    super(message);
    this.name = 'ClaimError';
  }
}

export class ClaimsService {
  private readonly slaEngine: SlaEngine;
  private readonly notifications: NotificationService;

  constructor(
    private readonly repo: ClaimsRepository,
    private readonly npaClient: NpaClient,
    private readonly fabricClient: FabricClient
  ) {
    this.slaEngine = new SlaEngine();
    this.notifications = new NotificationService();
  }

  async submitClaim(data: ClaimSubmission, orgId: string) {
    const existing = await this.repo.findByNpaReference(data.npaReference);
    if (existing) {
      throw new ClaimError('DUPLICATE_NPA_REFERENCE', 'NPA reference already submitted');
    }

    const npaVerification = await this.npaClient.verifyCargoDelivery({
      brvManifestId: data.brvManifestId,
      fuelType: data.fuelType,
      volumeLiters: data.volumeLiters,
    });

    if (!npaVerification.delivered) {
      throw new ClaimError('NPA_VERIFICATION_FAILED', 'Cargo delivery not confirmed in NPA system');
    }

    const claim = await this.repo.create(data, orgId);

    const fabricTx = await this.fabricClient.logClaim({
      claimId: claim.id,
      claimType: data.claimType,
      npaReference: data.npaReference,
      verificationHash: npaVerification.hash,
    });

    const updated = await this.repo.updateStatus(
      claim.id,
      'NPA_DATA_CROSSED',
      orgId,
      'SYSTEM',
      { npaVerification, fabricTxId: fabricTx }
    );

    return updated;
  }

  async verifyPhysicalDelivery(claimId: string, actorId: string) {
    const claim = await this.repo.findById(claimId);
    if (!claim) throw new ClaimError('CLAIM_NOT_FOUND', 'Claim does not exist');
    if (claim.status !== 'NPA_DATA_CROSSED') {
      throw new ClaimError('INVALID_STATUS', 'Claim must be in NPA_DATA_CROSSED status');
    }

    const deliveryConfirmation = await this.npaClient.confirmPhysicalDelivery({
      brvManifestId: claim.brvManifestId || undefined,
      fuelType: claim.fuelType,
    });

    if (!deliveryConfirmation.confirmed) {
      throw new ClaimError('DELIVERY_NOT_CONFIRMED', 'Physical delivery not confirmed');
    }

    return this.repo.updateStatus(
      claimId,
      'PHYSICAL_DELIVERY_CONFIRMED',
      actorId,
      'NPA_VALIDATOR',
      { deliveryConfirmation }
    );
  }

  async activateSLA(claimId: string) {
    const claim = await this.repo.findById(claimId);
    if (!claim) throw new ClaimError('CLAIM_NOT_FOUND', 'Claim does not exist');
    if (claim.status !== 'PHYSICAL_DELIVERY_CONFIRMED') {
      throw new ClaimError('INVALID_STATUS', 'Claim must be physically confirmed');
    }

    const fabricTx = await this.fabricClient.logVerifiedClaim({
      claimId: claim.id,
      claimType: claim.claimType,
      claimedAmountGhs: parseFloat(claim.claimedAmountGhs),
      slaDeadline: this.slaEngine.calculateDeadline(claim.claimType),
    });

    const updated = await this.repo.updateStatus(
      claimId,
      'VERIFIED_LOGGED',
      'SYSTEM',
      'SLA_ENGINE',
      { fabricTxId: fabricTx }
    );

    await this.notifications.send({
      type: 'CLAIM_VERIFIED',
      claimId,
      orgId: claim.claimantOrgId,
    });

    return updated;
  }

  async markAsPaid(claimId: string, fabricTxId: string) {
    const claim = await this.repo.findById(claimId);
    if (!claim) throw new ClaimError('CLAIM_NOT_FOUND', 'Claim does not exist');

    const updated = await this.repo.updateStatus(
      claimId,
      'PAID',
      'SYSTEM',
      'SETTLEMENT',
      { fabricTxId }
    );

    await this.notifications.send({
      type: 'CLAIM_PAID',
      claimId,
      orgId: claim.claimantOrgId,
    });

    return updated;
  }

  async getClaims(query: ClaimQuery) {
    return this.repo.findMany(query);
  }

  async getClaimById(id: string) {
    const claim = await this.repo.findById(id);
    if (!claim) throw new ClaimError('CLAIM_NOT_FOUND', 'Claim does not exist');
    return claim;
  }

  async getClaimAuditLog(claimId: string) {
    return this.repo.getAuditLog(claimId);
  }

  async getStats(orgId?: string) {
    return this.repo.getStats(orgId);
  }
}
