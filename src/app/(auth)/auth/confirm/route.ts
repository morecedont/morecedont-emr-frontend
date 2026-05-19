// Consume el enlace del email de recuperación. Soporta los dos formatos
// que puede emitir el template de Supabase: PKCE (?code) y OTP
// (?token_hash&type=recovery). Deja la sesión de recovery y manda al form.
// GET porque el link del email es un redirect externo (no es una mutación).
//
// IMPORTANTE: el cliente de Supabase debe escribir las cookies de sesión
// directamente sobre el objeto NextResponse, no via cookies() de next/headers.
// De lo contrario el redirect se emite sin las cookies y la sesión se pierde.

import { NextRequest, NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createServerClient } from "@supabase/ssr"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null

  if (!code && !(tokenHash && type)) {
    return NextResponse.redirect(new URL("/forgot-password?error=link", origin))
  }

  const response = NextResponse.redirect(new URL("/reset-password", origin))

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else {
      const { error } = await supabase.auth.verifyOtp({
        type: type!,
        token_hash: tokenHash!,
      })
      if (error) throw error
    }
    return response
  } catch (err) {
    console.error("auth confirm:", err)
    return NextResponse.redirect(
      new URL("/forgot-password?error=expired", origin)
    )
  }
}
