import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/fleet-management(.*)',
  '/dispatch(.*)',
  '/marketplace(.*)',
  '/real-time(.*)',
  '/ml-route-optimizer(.*)',
  '/settings(.*)',
  '/api-integrations(.*)',
  '/free-maps(.*)'
])

const isPublicApiRoute = createRouteMatcher([
  '/api/test-auth',
  '/api/marketplace/cargo'
])

export default clerkMiddleware((auth, req) => {
  // Don't protect API routes - let them handle auth internally
  if (req.nextUrl.pathname.startsWith('/api/')) {
    return
  }
  
  // Only protect page routes, not API routes
  if (isProtectedRoute(req)) {
    auth().protect()
  }
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
} 