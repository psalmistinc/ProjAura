import { createHash, randomBytes } from 'crypto';

export function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function generateIdempotencyKey(): string {
  return randomBytes(32).toString('hex');
}

export function verifySignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const expectedSignature = createHash('sha256')
    .update(`${secret}.${payload}`)
    .digest('hex');
  return expectedSignature === signature;
}
