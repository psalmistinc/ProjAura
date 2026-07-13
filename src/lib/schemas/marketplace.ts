import { z } from 'zod';

export const bidSubmissionSchema = z.object({
  assetId: z.string().uuid(),
  discountRate: z.number().min(0.005).max(0.15),
  fundedAmountGhs: z.number().positive().max(100_000_000),
  tenorDays: z.number().int().min(1).max(90),
  expirySeconds: z.number().int().min(60).max(86400).default(3600),
});

export const assetQuerySchema = z.object({
  assetStatus: z
    .enum(['LISTED', 'BIDDING_ACTIVE', 'MATCHED', 'SETTLED', 'MATURED_UNPAID'])
    .optional(),
  fuelType: z.enum(['PMS', 'GO', 'AGO', 'LPG']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['created_at', 'face_value_ghs', 'maturity_date']).default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const bidQuerySchema = z.object({
  assetId: z.string().uuid().optional(),
  bidderOrgId: z.string().uuid().optional(),
  bidStatus: z.enum(['ACTIVE', 'ACCEPTED', 'REJECTED', 'EXPIRED']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type BidSubmission = z.infer<typeof bidSubmissionSchema>;
export type AssetQuery = z.infer<typeof assetQuerySchema>;
export type BidQuery = z.infer<typeof bidQuerySchema>;
