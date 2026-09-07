/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Rate Limiting Middleware for LMSE Backend API
 */

import { Request, Response, NextFunction } from 'express';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

export class RateLimiter {
  private static store: Map<string, RateLimitRecord> = new Map();

  /**
   * Resets the internal rate limit store (useful for testing)
   */
  public static clearStore(): void {
    RateLimiter.store.clear();
  }

  /**
   * Creates an Express middleware for rate limiting
   */
  public static createMiddleware(options: {
    windowMs: number;
    max: number;
    message?: string;
    keyGenerator?: (req: Request) => string;
  }) {
    const { windowMs, max, message = 'Trop de requêtes. Veuillez réessayer plus tard.', keyGenerator } = options;

    return (req: Request, res: Response, next: NextFunction) => {
      const key = keyGenerator ? keyGenerator(req) : (req.ip || req.headers['x-forwarded-for'] as string || 'global_client');
      const now = Date.now();

      let record = RateLimiter.store.get(key);
      if (!record || now > record.resetTime) {
        record = {
          count: 1,
          resetTime: now + windowMs,
        };
        RateLimiter.store.set(key, record);
        return next();
      }

      record.count += 1;
      if (record.count > max) {
        res.setHeader('Retry-After', Math.ceil((record.resetTime - now) / 1000));
        return res.status(429).json({
          error: 'RATE_LIMIT_EXCEEDED',
          message,
          retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
        });
      }

      return next();
    };
  }
}
