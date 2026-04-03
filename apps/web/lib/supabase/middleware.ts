import { createServerClient } from '@supabase/ssr'
import type { Database } from '@sixdegrees/types'
import type { NextRequest, NextResponse } from 'next/server'

// Creates a Supabase client scoped to a middleware request/response pair.
// Both request and response are mutated so that refreshed session cookies
// are propagated to the browser on every response.
export function createMiddlewareClient(
  request: NextRequest,
  response: NextResponse
) {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Write updated cookies onto the outgoing request so subsequent
          // server reads see the refreshed values within this request cycle.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          // Write onto the response so the browser receives the new cookies.
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
}
