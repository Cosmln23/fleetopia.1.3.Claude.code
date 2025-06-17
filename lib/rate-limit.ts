import { NextRequest } from 'next/server';

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

interface RateLimitOptions {
  limit: number; // Number of requests allowed
  windowMs: number; // Time window in milliseconds
  keyGenerator?: (request: NextRequest) => string; // Custom key generator
  message?: string; // Custom error message
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

class RateLimitError extends Error {
  constructor(message: string, public retryAfter: number) {
    super(message);
    this.name = 'RateLimitError';
  }
}

/**
 * Rate limiting middleware for API routes
 */
export function rateLimit(options: RateLimitOptions) {
  const {
    limit,
    windowMs,
    keyGenerator = (req) => getClientIdentifier(req),
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false,
    skipFailedRequests = false
  } = options;

  return {
    check: async (request: NextRequest): Promise<{ success: boolean; limit: number; remaining: number; reset: number }> => {
      const key = keyGenerator(request);
      const now = Date.now();
      
      // Clean up expired entries
      cleanupExpiredEntries(now);
      
      // Get or create rate limit entry
      let entry = rateLimitStore.get(key);
      if (!entry || now > entry.resetTime) {
        entry = {
          count: 0,
          resetTime: now + windowMs
        };
        rateLimitStore.set(key, entry);
      }
      
      // Check if limit exceeded
      if (entry.count >= limit) {
        const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
        throw new RateLimitError(message, retryAfter);
      }
      
      // Increment counter
      entry.count++;
      
      return {
        success: true,
        limit,
        remaining: Math.max(0, limit - entry.count),
        reset: entry.resetTime
      };
    },
    
    // Method to reset rate limit for a specific key
    reset: (request: NextRequest) => {
      const key = keyGenerator(request);
      rateLimitStore.delete(key);
    }
  };
}

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(request: NextRequest): string {
  // Try to get real IP from headers (when behind proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  if (realIp) {
    return realIp;
  }
  
  // Fallback to connection remote address
  return request.ip || 'unknown';
}

/**
 * Clean up expired entries from the rate limit store
 */
function cleanupExpiredEntries(now: number) {
  for (const [key, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Predefined rate limiters for different API endpoints
 */
export const rateLimiters = {
  // General API rate limiting
  general: rateLimit({
    limit: 100, // 100 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    message: 'Too many requests from this IP, please try again after 15 minutes.'
  }),
  
  // Strict rate limiting for authentication endpoints
  auth: rateLimit({
    limit: 5, // 5 attempts
    windowMs: 15 * 60 * 1000, // per 15 minutes
    message: 'Too many authentication attempts, please try again after 15 minutes.'
  }),
  
  // Rate limiting for create operations
  create: rateLimit({
    limit: 20, // 20 creates
    windowMs: 60 * 1000, // per minute
    message: 'Too many create requests, please slow down.'
  }),
  
  // Rate limiting for search/query operations
  search: rateLimit({
    limit: 200, // 200 searches
    windowMs: 15 * 60 * 1000, // per 15 minutes
    message: 'Too many search requests, please try again later.'
  }),
  
  // Rate limiting for chat messages
  chat: rateLimit({
    limit: 50, // 50 messages
    windowMs: 60 * 1000, // per minute
    message: 'Too many messages sent, please slow down.'
  }),
  
  // Rate limiting for file uploads
  upload: rateLimit({
    limit: 10, // 10 uploads
    windowMs: 60 * 1000, // per minute
    message: 'Too many file uploads, please wait before uploading again.'
  })
};

/**
 * Middleware helper to apply rate limiting to API routes
 */
export async function applyRateLimit(
  request: NextRequest,
  rateLimiter: ReturnType<typeof rateLimit>
): Promise<{ success: boolean; headers: Record<string, string> }> {
  try {
    const result = await rateLimiter.check(request);
    
    return {
      success: true,
      headers: {
        'X-RateLimit-Limit': result.limit.toString(),
        'X-RateLimit-Remaining': result.remaining.toString(),
        'X-RateLimit-Reset': new Date(result.reset).toISOString(),
      }
    };
  } catch (error) {
    if (error instanceof RateLimitError) {
      return {
        success: false,
        headers: {
          'X-RateLimit-Limit': '0',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(Date.now() + error.retryAfter * 1000).toISOString(),
          'Retry-After': error.retryAfter.toString(),
        }
      };
    }
    throw error;
  }
}

export { RateLimitError };