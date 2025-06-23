// middleware.ts
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Define public routes that don't require authentication
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/contact',
  '/find-a-distributor',
  '/distributor-application',
  '/privacy-policy',
  '/terms-of-service',
  '/videos',
  '/api/send-email',
  '/api/send-admin-notification',
  '/api/distributor-application',
  '/api/distributors',
  '/api/stripe/webhooks',
  '/api/admin/init-database',
  '/api/admin/cleanup-orders',
  '/api/admin/reset-orders',
  '/api/admin/clean-distributors',
  '/api/orders/send-completion-emails',
  '/api/orders/update-payment-status',
  '/api/test-db',
  '/api/test-email-format',
  '/api/test-order-creation'
]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes except public ones
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
