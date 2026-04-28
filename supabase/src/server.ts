import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    return null
  }
  
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) {
    return null
  }
  
  return data
}

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Service role client — bypass RLS, use ONLY for admin operations.
 *
 * Validates required env vars upfront with a descriptive error message so
 * callers get an actionable hint instead of the generic
 * `Error: supabaseKey is required` thrown by `@supabase/supabase-js` when
 * `process.env.SUPABASE_SERVICE_ROLE_KEY` is undefined.
 *
 * Real-world incident this guards against (2026-04-28): an operator edit
 * to `/srv/bikinbot/fe/.env.local` accidentally dropped the
 * `SUPABASE_SERVICE_ROLE_KEY` line. The 4 admin pages that call this
 * function (`/admin`, `/admin/alerts`, `/admin/finance`,
 * `/admin/watchdog`) crashed during SSR with the generic
 * `supabaseKey is required` message and a Next.js error digest, leaving
 * super_admins to dig through pm2 logs to find the cause. The new error
 * tells them exactly what to fix and where.
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url) {
    throw new Error(
      'createServiceClient: NEXT_PUBLIC_SUPABASE_URL is required. ' +
      'Set it in the host .env.local (e.g. /srv/bikinbot/fe/.env.local) ' +
      'and restart the Next.js process.',
    )
  }
  if (!serviceKey) {
    throw new Error(
      'createServiceClient: SUPABASE_SERVICE_ROLE_KEY is required for admin operations. ' +
      'Set it in the host .env.local (e.g. /srv/bikinbot/fe/.env.local) ' +
      'and restart the Next.js process. Without it, every admin page ' +
      'will crash during SSR with the generic "supabaseKey is required" error.',
    )
  }
  return createSupabaseClient(url, serviceKey, { auth: { persistSession: false } })
}
