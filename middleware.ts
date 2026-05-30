import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  // `getClaims()` valida el JWT localmente (con las JWT signing keys del
  // proyecto) en vez de hacer un round-trip de red al servidor Auth como
  // `getUser()`. Corre en CADA navegación, así que ahorrar esa llamada
  // remota es la mayor ganancia de latencia del middleware.
  const {
    data: claimsData,
  } = await supabase.auth.getClaims()
  const userId = claimsData?.claims.sub ?? null

  const { pathname } = request.nextUrl

  const isHomePage = pathname === "/"
  const isLoginPage = pathname === "/login"
  const isRegisterPage = pathname === "/register"
  const isPendingPage = pathname.startsWith("/register/pending")
  const isRejectedPage = pathname.startsWith("/register/rejected")
  // Flujo de recuperación de contraseña (accesible sin sesión).
  const isPasswordRecovery =
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/auth/confirm"

  // Unauthenticated: allow public pages
  if (!userId) {
    if (
      !isHomePage &&
      !isLoginPage &&
      !isRegisterPage &&
      !isPendingPage &&
      !isRejectedPage &&
      !isPasswordRecovery
    ) {
      return NextResponse.redirect(new URL("/login", request.nextUrl))
    }
    return supabaseResponse
  }

  // Authenticated: check profile status
  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", userId)
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
