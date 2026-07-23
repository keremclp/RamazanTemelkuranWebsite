/* ============================================
   Proxy (Next.js 16 — replaces middleware.ts)
   Protects /admin/* routes except /admin/login
   Refreshes Supabase auth sessions
   ============================================ */

import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh the auth session
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = request.nextUrl.pathname === "/admin/login";
  let isAdmin = false;

  if (user) {
    const { data, error } = await supabase.rpc("is_admin");
    isAdmin = !error && data === true;
  }

  function redirectWithSessionCookies(url: URL) {
    const response = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie);
    });
    return response;
  }

  if (isAdminRoute && !isLoginPage && (!user || !isAdmin)) {
    if (user) {
      await supabase.auth.signOut({ scope: "local" });
    }
    const loginUrl = new URL("/admin/login", request.nextUrl);
    return redirectWithSessionCookies(loginUrl);
  }

  if (isLoginPage && user && isAdmin) {
    const adminUrl = new URL("/admin", request.nextUrl);
    return redirectWithSessionCookies(adminUrl);
  }

  if (isLoginPage && user && !isAdmin) {
    await supabase.auth.signOut({ scope: "local" });
  }

  return supabaseResponse;
}

export const config = {
  matcher: "/admin/:path*",
};
