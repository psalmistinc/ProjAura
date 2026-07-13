import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  DATABASE_POOL_MIN: z.coerce.number().default(2),
  DATABASE_POOL_MAX: z.coerce.number().default(10),
  REDIS_URL: z.string().url(),
  NEXTAUTH_SECRET: z.string().min(32),
  NEXTAUTH_URL: z.string().url(),
  NPA_API_BASE_URL: z.string().url(),
  NPA_API_KEY: z.string().min(1),
  NPA_WEBHOOK_SECRET: z.string().min(1),
  RTGS_API_BASE_URL: z.string().url(),
  RTGS_API_KEY: z.string().min(1),
  FABRIC_CHANNEL_NAME: z.string().default('UPPF_Claims'),
  FABRIC_CHAINCODE_NAME: z.string().default('claims'),
  FABRIC_MSP_ID: z.string(),
  FABRIC_PEER_ENDPOINT: z.string(),
  FABRIC_CA_ENDPOINT: z.string(),
  APP_ENV: z.enum(['development', 'staging', 'production']),
  ENABLE_MOCKS: z.coerce.boolean().default(false),
});

function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}

export const env = validateEnv();
