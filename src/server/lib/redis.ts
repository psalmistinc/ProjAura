import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.REDIS_URL!,
      token: process.env.UPSTASH_REDIS_TOKEN || undefined,
    });
  }
  return redis;
}

// Simple cache helper with TTL
export async function cached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  const r = getRedis();
  const cached = await r.get<T>(key);
  if (cached !== null) return cached;

  const data = await fetcher();
  await r.set(key, JSON.stringify(data), { ex: ttlSeconds });
  return data;
}

// Rate limiting using Redis sorted sets
export async function rateLimitCheck(
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const r = getRedis();
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;

  const pipeline = r.pipeline();
  pipeline.zremrangebyscore(key, 0, windowStart);
  pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
  pipeline.zcard(key);
  pipeline.expire(key, windowSeconds);

  const results = await pipeline.exec();
  const requestCount = results[2] as number;

  return {
    allowed: requestCount <= maxRequests,
    remaining: Math.max(0, maxRequests - requestCount),
    resetAt: Math.ceil((now + windowSeconds * 1000) / 1000),
  };
}

// Marketplace bid matching — Redis sorted set for real-time bid ranking
export async function addBidToSortedSet(
  assetId: string,
  bidId: string,
  discountRate: number
) {
  const r = getRedis();
  const key = `bids:asset:${assetId}`;
  await r.zadd(key, { score: discountRate, member: bidId });
}

export async function getBestBidForAsset(assetId: string): Promise<string | null> {
  const r = getRedis();
  const key = `bids:asset:${assetId}`;
  // Lowest discount rate = best for claimant
  const result = await r.zrange(key, 0, 0, { withScores: false });
  return result.length > 0 ? (result[0] as string) : null;
}

export async function removeBidFromSortedSet(assetId: string, bidId: string) {
  const r = getRedis();
  await r.zrem(`bids:asset:${assetId}`, bidId);
}
