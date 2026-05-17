import { createServerClient } from '@supabase/ssr'

// 2026-05-17 (BikinBot Plan 39b8f229 / Fastify Sprint F):
// Two factories live in this file:
//
//   1. `createServerClientWithCookies(handlers)` — framework-agnostic.
//      The HTTP framework (Next.js, Fastify, Express, ...) hands us its
//      own cookie getter/setter and we wrap it for `@supabase/ssr`.
//      This is the API to call from new code, including the Fastify
//      backend migration that lives in `bikinbot-be`.
//
//   2. `createClient()` — Next.js convenience wrapper kept for backward
//      compatibility with the existing FE (`bikinbot-fe`) and BE
//      route handlers that still rely on `cookies()` from
//      `next/headers`. The `next/headers` import is intentionally LAZY
//      (dynamic import inside the function body) so that this entire
//      `server.ts` module can be imported from non-Next.js runtimes
//      (e.g. Fastify boot path) without `next/headers` exploding at
//      module-load time.
//
// Once `bikinbot-fe` has also migrated off the no-args `createClient()`
// pattern (no concrete timeline yet), the legacy wrapper below can be
// deleted.

export interface SupabaseCookieToSet {
  name: string
  value: string
  // Mirrors @supabase/ssr's loose cookie option shape. Kept as a wide
  // type so both Next.js's `RequestCookie` options and @fastify/cookie's
  // `CookieSerializeOptions` slot in without an extra cast at the call site.
  options?: Record<string, unknown>
}

export interface SupabaseCookieHandlers {
  getAll(): Array<{ name: string; value: string }>
  /**
   * Persist cookies back to the response. Optional because some callers
   * (e.g. cron / service-role paths, read-only hooks) intentionally drop
   * Supabase's token-refresh writes.
   */
  setAll?(cookiesToSet: SupabaseCookieToSet[]): void
}

/**
 * Framework-agnostic factory. Use this from any HTTP framework by passing
 * cookie handlers wired to that framework's request/response objects.
 *
 * Example (Fastify):
 *
 *   createServerClientWithCookies({
 *     getAll: () => parseCookieHeader(req.headers.cookie ?? ''),
 *     setAll: (cookies) => cookies.forEach(c =>
 *       reply.setCookie(c.name, c.value, c.options as any)
 *     ),
 *   })
 */
export function createServerClientWithCookies(handlers: SupabaseCookieHandlers) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return handlers.getAll()
        },
        setAll(cookiesToSet) {
          if (!handlers.setAll) return
          try {
            handlers.setAll(cookiesToSet as SupabaseCookieToSet[])
          } catch {
            // Same semantics as the legacy wrapper: setAll inside a
            // Server Component or any read-only context is non-fatal.
          }
        },
      },
    },
  )
}

/**
 * Next.js-flavoured factory. Uses `cookies()` from `next/headers` and is
 * intended for Next.js Server Components, Route Handlers, and Server
 * Actions. The `next/headers` import is lazy (dynamic import) so
 * non-Next.js runtimes can still safely import this module.
 */
export async function createClient() {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClientWithCookies({
    getAll() {
      return cookieStore.getAll()
    },
    setAll(cookiesToSet) {
      try {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(
            name,
            value,
            options as Parameters<typeof cookieStore.set>[2],
          ),
        )
      } catch {
        // The `setAll` method was called from a Server Component.
        // This can be ignored if you have middleware refreshing
        // user sessions.
      }
    },
  })
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
