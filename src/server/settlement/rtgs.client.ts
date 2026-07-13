export interface RtgsTransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  reference: string;
  narrative: string;
}

export interface RtgsTransferResponse {
  success: boolean;
  transactionId: string;
  reference: string;
  status: 'QUEUED' | 'SETTLED' | 'FAILED';
  timestamp: string;
}

export class RtgsClient {
  private baseUrl: string;
  private apiKey: string;

  constructor() {
    this.baseUrl = process.env.RTGS_API_BASE_URL!;
    this.apiKey = process.env.RTGS_API_KEY!;
  }

  async initiateTransfer(
    request: RtgsTransferRequest
  ): Promise<RtgsTransferResponse> {
    if (process.env.ENABLE_MOCKS === 'true') {
      return {
        success: true,
        transactionId: `TXN-${Date.now()}`,
        reference: request.reference,
        status: 'SETTLED',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const response = await fetch(`${this.baseUrl}/transfers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`RTGS API error: ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('[RTGS Client] Transfer failed:', error);
      throw new Error('RTGS transfer service unavailable');
    }
  }

  async checkTransferStatus(transactionId: string) {
    if (process.env.ENABLE_MOCKS === 'true') {
      return {
        transactionId,
        status: 'SETTLED',
        timestamp: new Date().toISOString(),
      };
    }

    const response = await fetch(
      `${this.baseUrl}/transfers/${transactionId}`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`RTGS status check error: ${response.status}`);
    }

    return response.json();
  }
}
