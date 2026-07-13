import { z } from 'zod';

export const claimSubmissionSchema = z.object({
  claimType: z.enum(['UNDER_RECOVERY', 'UPPF']),
  npaReference: z.string().min(1).max(50),
  brvManifestId: z.string().max(50).optional(),
  fuelType: z.enum(['PMS', 'GO', 'AGO', 'LPG']),
  volumeLiters: z.number().positive().max(10_000_000),
  claimedAmountGhs: z.number().positive().max(100_000_000),
  exchangeRateUsd: z.number().positive().optional(),
  supportingDocs: z.array(z.string()).max(10).optional(),
});

export const claimQuerySchema = z.object({
  status: z
    .enum([
      'SUBMITTED',
      'NPA_DATA_CROSSED',
      'PHYSICAL_DELIVERY_CONFIRMED',
      'VERIFIED_LOGGED',
      'SLA_ACTIVE',
      'SLA_BREACHED',
      'PAID',
      'DISPUTED',
      'REJECTED',
    ])
    .optional(),
  claimType: z.enum(['UNDER_RECOVERY', 'UPPF']).optional(),
  claimantOrgId: z.string().uuid().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum(['created_at', 'sla_deadline', 'claimed_amount_ghs'])
    .default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const claimStatusUpdateSchema = z.object({
  status: z.enum([
    'NPA_DATA_CROSSED',
    'PHYSICAL_DELIVERY_CONFIRMED',
    'VERIFIED_LOGGED',
    'SLA_ACTIVE',
    'SLA_BREACHED',
    'PAID',
    'DISPUTED',
    'REJECTED',
  ]),
  verificationData: z.record(z.string(), z.unknown()).optional(),
});

export type ClaimSubmission = z.infer<typeof claimSubmissionSchema>;
export type ClaimQuery = z.infer<typeof claimQuerySchema>;
export type ClaimStatusUpdate = z.infer<typeof claimStatusUpdateSchema>;
