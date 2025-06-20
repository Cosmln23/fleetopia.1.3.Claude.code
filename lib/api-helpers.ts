import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { auth } from '@clerk/nextjs/server';
import { applyRateLimit, rateLimiters, RateLimitError } from './rate-limit';

interface ApiHandlerOptions {
  requireAuth?: boolean;
  rateLimiter?: ReturnType<typeof import('./rate-limit').rateLimit>;
  bodySchema?: z.ZodSchema;
  querySchema?: z.ZodSchema;
  paramsSchema?: z.ZodSchema;
}

interface ApiContext {
  req: NextRequest;
  session: any;
  body?: any;
  query?: any;
  params?: any;
}

type ApiHandler = (context: ApiContext) => Promise<NextResponse>;

/**
 * Enhanced API route handler with validation, authentication, and rate limiting
 */
export function createApiHandler(options: ApiHandlerOptions = {}) {
  const {
    requireAuth = false,
    rateLimiter = rateLimiters.general,
    bodySchema,
    querySchema,
    paramsSchema
  } = options;

  return function withApiHandler(handler: ApiHandler) {
    return async function apiRouteHandler(
      request: NextRequest,
      context: { params: Record<string, string | string[]> }
    ): Promise<NextResponse> {
      try {
        // Apply rate limiting
        const rateLimitResult = await applyRateLimit(request, rateLimiter);
        if (!rateLimitResult.success) {
          return NextResponse.json(
            { 
              error: 'Rate limit exceeded', 
              message: 'Too many requests, please try again later.' 
            },
            { 
              status: 429,
              headers: rateLimitResult.headers
            }
          );
        }

        // Get session if auth is required
        let session = null;
        if (requireAuth) {
          const { userId } = await auth();
          if (!userId) {
            return NextResponse.json(
              { error: 'Unauthorized', message: 'Authentication required' },
              { status: 401 }
            );
          }
          session = { user: { id: userId } };
        }

        // Parse and validate request body
        let body = null;
        if (bodySchema && ['POST', 'PUT', 'PATCH'].includes(request.method)) {
          try {
            const rawBody = await request.json();
            body = bodySchema.parse(rawBody);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                { 
                  error: 'Validation failed', 
                  message: 'Invalid request body',
                  details: error.errors 
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        // Parse and validate query parameters
        let query = null;
        if (querySchema) {
          const url = new URL(request.url);
          const queryParams = Object.fromEntries(url.searchParams.entries());
          try {
            query = querySchema.parse(queryParams);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                { 
                  error: 'Validation failed', 
                  message: 'Invalid query parameters',
                  details: error.errors 
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        // Parse and validate route parameters
        let params = null;
        if (paramsSchema && context.params) {
          try {
            params = paramsSchema.parse(context.params);
          } catch (error) {
            if (error instanceof z.ZodError) {
              return NextResponse.json(
                { 
                  error: 'Validation failed', 
                  message: 'Invalid route parameters',
                  details: error.errors 
                },
                { status: 400 }
              );
            }
            throw error;
          }
        }

        // Call the actual handler
        const response = await handler({
          req: request,
          session,
          body,
          query,
          params: params || context.params
        });

        // Add rate limit headers to successful responses
        Object.entries(rateLimitResult.headers).forEach(([key, value]) => {
          response.headers.set(key, value);
        });

        return response;

      } catch (error) {
        console.error('[API_HANDLER_ERROR]', error);

        if (error instanceof RateLimitError) {
          return NextResponse.json(
            { error: 'Rate limit exceeded', message: error.message },
            { 
              status: 429,
              headers: {
                'Retry-After': error.retryAfter.toString(),
              }
            }
          );
        }

        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { 
              error: 'Validation failed', 
              message: 'Invalid request data',
              details: error.errors 
            },
            { status: 400 }
          );
        }

        // Generic server error
        return NextResponse.json(
          { 
            error: 'Internal server error', 
            message: process.env.NODE_ENV === 'development' 
              ? error instanceof Error ? error.message : 'Unknown error'
              : 'Something went wrong'
          },
          { status: 500 }
        );
      }
    };
  };
}

/**
 * Common API response helpers
 */
export const apiResponse = {
  success: (data: any, status = 200) => {
    return NextResponse.json({ success: true, data }, { status });
  },

  error: (message: string, status = 400, details?: any) => {
    return NextResponse.json(
      { 
        success: false, 
        error: message, 
        ...(details && { details }) 
      },
      { status }
    );
  },

  unauthorized: (message = 'Authentication required') => {
    return NextResponse.json(
      { success: false, error: 'Unauthorized', message },
      { status: 401 }
    );
  },

  forbidden: (message = 'Access denied') => {
    return NextResponse.json(
      { success: false, error: 'Forbidden', message },
      { status: 403 }
    );
  },

  notFound: (message = 'Resource not found') => {
    return NextResponse.json(
      { success: false, error: 'Not Found', message },
      { status: 404 }
    );
  },

  conflict: (message = 'Resource conflict') => {
    return NextResponse.json(
      { success: false, error: 'Conflict', message },
      { status: 409 }
    );
  },

  rateLimit: (message = 'Too many requests', retryAfter?: number) => {
    const headers: Record<string, string> = {};
    if (retryAfter) {
      headers['Retry-After'] = retryAfter.toString();
    }
    
    return NextResponse.json(
      { success: false, error: 'Rate Limit Exceeded', message },
      { status: 429, headers }
    );
  }
};

/**
 * Validation helper for manual validation
 */
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map(e => e.message).join(', ')}`);
    }
    throw error;
  }
}

/**
 * Helper to check if user owns a resource
 */
export function checkResourceOwnership(
  resourceUserId: string,
  sessionUserId: string
): boolean {
  return resourceUserId === sessionUserId;
}

/**
 * Helper to sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>\"'&]/g, '') // Remove potentially dangerous characters
    .substring(0, 1000); // Limit length
}

/**
 * Helper to generate pagination metadata
 */
export function getPaginationMeta(
  page: number,
  limit: number,
  total: number
) {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null
  };
}
