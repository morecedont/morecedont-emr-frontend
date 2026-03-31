import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isHomePage = pathname === "/"
  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"
  const isPendingPage = pathname.startsWith("/register/pending")
  const isRejectedPage = pathname.startsWith("/register/rejected")

  // Unauthenticated: allow public pages
  if (!user) {
    if (!isHomePage && !isLoginPage && !isRegisterPage && !isPendingPage && !isRejectedPage) {
      return NextResponse.redirect(new URL("/login", request.nextUrl))
    }
    return supabaseResponse
  }

  // Authenticated: check profile status
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", user.id)
    .single()

  const status = profile?.status ?? "active"

  if (status === "pending") {
    if (!isPendingPage) {
      return NextResponse.redirect(new URL("/register/pending", request.nextUrl))
    }
    return supabaseResponse
  }

  if (status === "rejected") {
    if (!isRejectedPage) {
      return NextResponse.redirect(new URL("/register/rejected", request.nextUrl))
    }
    return supabaseResponse
  }

  // Active user: redirect away from auth pages
  if (isLoginPage || isRegisterPage) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
