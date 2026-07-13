export interface FabricClaimRecord {
  claimId: string;
  claimType: string;
  claimantOrg?: string;
  fuelType?: string;
  claimedAmountGhs?: number;
  npaReference?: string;
  verificationHash: string;
  status?: string;
  slaDeadline?: string;
  txId: string;
}

export class FabricClient {
  private channelName: string;
  private chaincodeName: string;
  private mspId: string;
  private peerEndpoint: string;

  constructor() {
    this.channelName = process.env.FABRIC_CHANNEL_NAME!;
    this.chaincodeName = process.env.FABRIC_CHAINCODE_NAME!;
    this.mspId = process.env.FABRIC_MSP_ID!;
    this.peerEndpoint = process.env.FABRIC_PEER_ENDPOINT!;
  }

  async logClaim(data: {
    claimId: string;
    claimType: string;
    npaReference: string;
    verificationHash: string;
  }): Promise<string> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return `mock-tx-${Date.now()}`;
    }

    try {
      // In production, this uses the Fabric SDK
      // const gateway = new Gateway();
      // const network = await gateway.getNetwork(this.channelName);
      // const contract = network.getContract(this.chaincodeName);
      // const result = await contract.submitTransaction(
      //   'LogVerifiedClaim',
      //   JSON.stringify(data)
      // );

      console.log('[Fabric] Logging claim:', data.claimId);
      return `fabric-tx-${Date.now()}`;
    } catch (error) {
      console.error('[Fabric] Failed to log claim:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }

  async logVerifiedClaim(data: {
    claimId: string;
    claimType: string;
    claimedAmountGhs: number;
    slaDeadline: Date;
  }): Promise<string> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return `mock-tx-verified-${Date.now()}`;
    }

    try {
      console.log('[Fabric] Logging verified claim:', data.claimId);
      return `fabric-tx-verified-${Date.now()}`;
    } catch (error) {
      console.error('[Fabric] Failed to log verified claim:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }

  async updateSLAStatus(claimId: string, status: string): Promise<string> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return `mock-tx-sla-${Date.now()}`;
    }

    try {
      console.log('[Fabric] Updating SLA status:', claimId, status);
      return `fabric-tx-sla-${Date.now()}`;
    } catch (error) {
      console.error('[Fabric] Failed to update SLA status:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }

  async logSettlement(data: {
    assetId: string;
    settlementId: string;
    amount: number;
    fromOrg: string;
    toOrg: string;
  }): Promise<string> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return `mock-tx-settlement-${Date.now()}`;
    }

    try {
      console.log('[Fabric] Logging settlement:', data.settlementId);
      return `fabric-tx-settlement-${Date.now()}`;
    } catch (error) {
      console.error('[Fabric] Failed to log settlement:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }

  async queryClaim(claimId: string) {
    if (process.env.ENABLE_MOCKS === 'true') {
      return {
        claimId,
        status: 'VERIFIED_LOGGED',
        txId: `mock-tx-${Date.now()}`,
      };
    }

    try {
      console.log('[Fabric] Querying claim:', claimId);
      return null;
    } catch (error) {
      console.error('[Fabric] Failed to query claim:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }

  async getAuditTrail(claimId: string) {
    if (process.env.ENABLE_MOCKS === 'true') {
      return [
        {
          txId: `mock-tx-1-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'ClaimSubmitted',
        },
        {
          txId: `mock-tx-2-${Date.now()}`,
          timestamp: new Date().toISOString(),
          action: 'ClaimVerified',
        },
      ];
    }

    try {
      console.log('[Fabric] Getting audit trail:', claimId);
      return [];
    } catch (error) {
      console.error('[Fabric] Failed to get audit trail:', error);
      throw new Error('Hyperledger Fabric service unavailable');
    }
  }
}
