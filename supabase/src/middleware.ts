import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  // If Supabase is not configured, allow all requests through
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protected routes (require login)
  const protectedPaths = ['/dashboard', '/settings', '/analytics', '/conversations', '/billing', '/setup', '/subscribe', '/support', '/admin']
  const isProtectedPath = protectedPaths.some(path => request.nextUrl.pathname.startsWith(path))

  if (isProtectedPath && !user) {
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

  // If user has active subscription and visits /subscribe, redirect to dashboard
  if (request.nextUrl.pathname === '/subscribe' && user) {
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
