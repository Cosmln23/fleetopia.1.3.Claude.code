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

export default clerkMiddleware((auth, req) => {
  if (isProtectedRoute(req)) auth().protect()
})

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
} 