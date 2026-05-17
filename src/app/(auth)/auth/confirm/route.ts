// Consume el enlace del email de recuperación. Soporta los dos formatos
// que puede emitir el template de Supabase: PKCE (?code) y OTP
// (?token_hash&type=recovery). Deja la sesión de recovery y manda al form.
// GET porque el link del email es un redirect externo (no es una mutación).

import { NextResponse } from "next/server"
import type { EmailOtpType } from "@supabase/supabase-js"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get("code")
  const tokenHash = url.searchParams.get("token_hash")
  const type = url.searchParams.get("type") as EmailOtpType | null

  const supabase = await createClient()

  try {
    if (code) {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      if (error) throw error
    } else if (tokenHash && type) {
      const { error } = await supabase.auth.verifyOtp({
        type,
        token_hash: tokenHash,
      })
      if (error) throw error
    } else {
      return NextResponse.redirect(
        new URL("/forgot-password?error=link", origin)
      )
    }
    return NextResponse.redirect(new URL("/reset-password", origin))
  } catch (err) {
    console.error("auth confirm:", err)
    return NextResponse.redirect(
      new URL("/forgot-password?error=expired", origin)
    )
  }
}
