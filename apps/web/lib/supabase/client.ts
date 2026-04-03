import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@sixdegrees/types'

// For use in Client Components ('use client').
// Returns a new instance each call — safe to call at the top of a component.
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
