import { NextRequest, NextResponse } from "next/server"
import { createMiddlewareClient } from "@/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { supabase, supabaseResponse } = createMiddlewareClient(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAuthPage =
    pathname.startsWith("/login") || pathname.startsWith("/register")

  if (!user && !isAuthPage) {
    return NextResponse.redirect(new URL("/login", request.nextUrl))
  }

  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl))
  }

  return supabaseResponse
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
