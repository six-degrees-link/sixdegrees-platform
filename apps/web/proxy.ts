// proxy.ts — Next.js 16 equivalent of middleware.ts
// Runs before every request to refresh the Supabase auth session so that
// Server Components always receive an up-to-date session cookie.

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createMiddlewareClient } from './lib/supabase/middleware';

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request });
  const supabase = createMiddlewareClient(request, response);

  // Calling getUser() triggers a token refresh if the session is expired.
  // The refreshed cookies are written onto `response` by createMiddlewareClient.
  await supabase.auth.getUser();

  return response;
}

export const config = {
  matcher: [
    // Run on all routes except Next.js internals and static files.
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
