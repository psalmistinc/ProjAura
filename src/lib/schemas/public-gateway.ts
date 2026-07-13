import { z } from 'zod';

export const priceQuerySchema = z.object({
  region: z
    .enum([
      'GREATER_ACCRA',
      'ASHANTI',
      'WESTERN',
      'EASTERN',
      'CENTRAL',
      'NORTHERN',
      'UPPER_EAST',
      'UPPER_WEST',
      'VOLTA',
      'BRONG_AHAFO',
      'Western_North',
      'Ahafo',
      'Bono_East',
      'Oti',
      'Savannah',
    ])
    .optional(),
  fuelType: z.enum(['PMS', 'GO', 'AGO', 'LPG']).optional(),
});

export const stationQuerySchema = z.object({
  region: z.string().optional(),
  stationName: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const reportSubmissionSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  complaintType: z.enum([
    'SHORT_DISPENSING',
    'FUEL_ADULTERATION',
    'PRICE_GOUGING',
    'UNLICENSED_SALE',
  ]),
  description: z.string().max(500).optional(),
  stationId: z.string().uuid().optional(),
});

export const reportQuerySchema = z.object({
  status: z
    .enum(['RECEIVED', 'TRIAGED', 'FORWARDED_TO_NPA', 'UNDER_INVESTIGATION', 'RESOLVED', 'DISMISSED'])
    .optional(),
  complaintType: z.enum(['SHORT_DISPENSING', 'FUEL_ADULTERATION', 'PRICE_GOUGING', 'UNLICENSED_SALE']).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PriceQuery = z.infer<typeof priceQuerySchema>;
export type StationQuery = z.infer<typeof stationQuerySchema>;
export type ReportSubmission = z.infer<typeof reportSubmissionSchema>;
export type ReportQuery = z.infer<typeof reportQuerySchema>;
