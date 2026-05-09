import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Tier 4 Phase 2 (2026-05-09) — protected paths kept in sync with the
// `protectedPaths` array below. Defined at module scope so the env-missing
// fast-path can use the same gate as the in-flow auth check.
const PROTECTED_PATH_PREFIXES = [
  '/dashboard', '/settings', '/analytics', '/conversations',
  '/billing', '/setup', '/subscribe', '/support', '/admin',
] as const

function isProtectedPath(pathname: string): boolean {
  return PROTECTED_PATH_PREFIXES.some((p) => pathname.startsWith(p))
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // Tier 4 Phase 2 (2026-05-09) — fail-closed when Supabase env is missing.
  //
  // Old behaviour: any unconfigured env let EVERY request through, including
  // protected paths like /dashboard or /admin. In a deploy where the env
  // failed to interpolate (e.g. PM2 restart with stale shell env, container
  // launched without secrets) the dashboard would render with no session
  // checks and downstream API calls would 401 — user-visible breakage but
  // no security audit trail.
  //
  // New behaviour:
  //   - production + protected path: return 503 with a clear config-error
  //     message so monitoring (status page / Cloudflare alerts) catches the
  //     misconfiguration immediately and protected pages don't render at all;
  //   - production + public path: let through so the marketing site / login
  //     stays visible (login itself will fail-soft because the supabase
  //     client throws when env is missing, but that's a recoverable UX path);
  //   - non-production: keep legacy let-through so local dev without
  //     Supabase still works.
  //
  // Always emit a console.error so the misconfiguration is visible in logs.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const isProd = process.env.NODE_ENV === 'production'
    const protectedHit = isProtectedPath(request.nextUrl.pathname)
    // eslint-disable-next-line no-console
    console.error(
      `[supabase-middleware] Supabase env missing (URL=${!!process.env.NEXT_PUBLIC_SUPABASE_URL} ANON_KEY=${!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}) prod=${isProd} path=${request.nextUrl.pathname} protected=${protectedHit}`,
    )
    if (isProd && protectedHit) {
      return new NextResponse(
        JSON.stringify({
          error: 'Service Misconfigured',
          detail: 'Authentication backend unavailable. Operator: confirm NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are set in the runtime environment.',
        }),
        { status: 503, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } },
      )
    }
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => {
            // Set cookie domain to .bikinbot.ai so it works across all subdomains (admin., www., etc.)
            const cookieOptions = { ...options }
            const host = request.headers.get('host') || ''
            if (host.includes('bikinbot.ai')) {
              cookieOptions.domain = '.bikinbot.ai'
            }
            supabaseResponse.cookies.set(name, value, cookieOptions)
          })
        },
      },
    }
  )

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // 2026-04-28 hardening — swallow `refresh_token_already_used` race.
  // Two concurrent in-flight requests (multi-tab, browser pre-fetch, etc.)
  // both try to redeem the same refresh token within a few hundred ms;
  // Supabase explicitly invalidates a refresh token after first use, so the
  // loser of the race gets `AuthApiError: Invalid Refresh Token: Already
  // Used`. This is benign — the winning request already rotated the
  // session — but pre-hardening the SDK rethrew it and pm2 logged 90+
  // events per day. We treat the loser as "unauthenticated for this
  // request" (no user) which the existing `isProtectedPath && !user` gate
  // already handles correctly via /login redirect.
  let user: Awaited<ReturnType<typeof supabase.auth.getUser>>['data']['user'] = null
  try {
    const result = await supabase.auth.getUser()
    user = result.data.user
  } catch (err) {
    const code = (err as { code?: string } | null)?.code
    if (code !== 'refresh_token_already_used') {
      // Genuine auth failure — still surface so we don't hide real bugs.
      // Logged once via console.warn (rate-limited at the runtime level by
      // pm2 log rotation) instead of unhandled rejection.
      // eslint-disable-next-line no-console
      console.warn('[supabase-middleware] auth.getUser failed:', code || (err as Error)?.message)
    }
    // user stays null
  }

  // Protected routes (require login). Pulled from the module-scope constant
  // so the env-missing fast-path above and this in-flow check can never
  // drift out of sync.
  const isProtectedPathHit = isProtectedPath(request.nextUrl.pathname)

  if (isProtectedPathHit && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Pay-first gate: logged in but no active subscription → redirect to /subscribe
  // (except if already on /subscribe or /api routes)
  const payGatedPaths = ['/dashboard', '/settings', '/analytics', '/conversations', '/setup']
  const isPayGated = payGatedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Admin paths bypass pay-gate
  const isAdminPath = request.nextUrl.pathname.startsWith('/admin')

  if (isPayGated && user && !isAdminPath) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'grace'])
      .single()

    if (!sub) {
      const url = request.nextUrl.clone()
      url.pathname = '/subscribe'
      return NextResponse.redirect(url)
    }
  }

  // If user has active subscription and visits /subscribe, redirect to dashboard.
  //
  // 2026-05-04 fix — honour explicit renewal intent. The Lever Z renewal
  // CTA on Beranda (RenewalBanner / UpgradePrompt) navigates to
  // `/subscribe?renew=true` precisely so a near-expiry user can pay early.
  // Their subscription is still `status='active'` while inside the 7-day
  // window, so without this bypass the middleware bounces them straight
  // back to /dashboard — the exact "tombol Perpanjang tidak berfungsi /
  // user diarahkan ke beranda" symptom reported on prod.
  if (request.nextUrl.pathname === '/subscribe' && user) {
    const renewIntent = request.nextUrl.searchParams.get('renew') === 'true'
    if (!renewIntent) {
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('id, status')
        .eq('user_id', user.id)
        .in('status', ['active'])
        .single()

      if (sub) {
        const url = request.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
      }
    }
  }

  // Redirect logged-in users away from auth pages
  // Allow /reset-password even when logged in (password recovery flow)
  if (request.nextUrl.pathname === '/reset-password') {
    return supabaseResponse
  }
  // But allow /register for users mid-payment flow (pending_payment status)
  if (request.nextUrl.pathname === '/login' && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // For register: only redirect if user has active subscription
  if (request.nextUrl.pathname === '/register' && user) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('id, status')
      .eq('user_id', user.id)
      .in('status', ['active', 'grace'])
      .single()

    if (sub) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
