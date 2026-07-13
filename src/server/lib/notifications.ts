export type NotificationType =
  | 'SLA_AT_RISK'
  | 'SLA_BREACHED'
  | 'CLAIM_VERIFIED'
  | 'CLAIM_PAID'
  | 'BID_RECEIVED'
  | 'SETTLEMENT_INITIATED';

export interface NotificationPayload {
  type: NotificationType;
  claimId?: string;
  assetId?: string;
  orgId: string;
  message?: string;
  deadline?: Date | null;
  metadata?: Record<string, unknown>;
}

export class NotificationService {
  async send(payload: NotificationPayload): Promise<void> {
    // In production, this would:
    // 1. Store notification in DB
    // 2. Send email via SendGrid/SES
    // 3. Send SMS via Twilio/Africa's Talking
    // 4. Push to WebSocket for real-time dashboard updates

    console.log('[Notification]', {
      type: payload.type,
      orgId: payload.orgId,
      claimId: payload.claimId,
      timestamp: new Date().toISOString(),
    });

    // Placeholder for actual notification dispatch
    switch (payload.type) {
      case 'SLA_BREACHED':
        await this.sendUrgentAlert(payload);
        break;
      case 'CLAIM_VERIFIED':
        await this.sendClaimantNotification(payload);
        break;
      case 'CLAIM_PAID':
        await this.sendSettlementConfirmation(payload);
        break;
      default:
        break;
    }
  }

  private async sendUrgentAlert(payload: NotificationPayload): Promise<void> {
    // Escalation: email NPA validators + claimant org
    console.log('[URGENT] SLA Breached:', payload.claimId);
  }

  private async sendClaimantNotification(
    payload: NotificationPayload
  ): Promise<void> {
    // Notify claimant that claim is verified and SLA started
    console.log('[NOTIFY] Claim verified:', payload.claimId);
  }

  private async sendSettlementConfirmation(
    payload: NotificationPayload
  ): Promise<void> {
    // Notify both parties of settlement
    console.log('[NOTIFY] Settlement confirmed:', payload.assetId);
  }
}
