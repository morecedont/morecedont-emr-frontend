// OAuth — callback. Google redirige acá con ?code&state.
// Identifica al doctor por la sesión, valida el state (CSRF) y guarda
// los tokens cifrados en doctor_google_tokens.

import { NextResponse } from "next/server"
import { getProfile } from "@/lib/session"
import { exchangeCode, verifyState } from "@/lib/google/oauth"
import { encryptToken } from "@/lib/google/crypto"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const origin = url.origin
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const oauthError = url.searchParams.get("error")

  const profile = await getProfile()
  if (!profile) {
    return NextResponse.redirect(new URL("/login", origin))
  }

  if (oauthError || !code || !state || !verifyState(state, profile.id)) {
    return NextResponse.redirect(new URL("/agenda?google=error", origin))
  }

  try {
    const tokens = await exchangeCode(code)
    if (!tokens.access_token || !tokens.refresh_token) {
      // Sin refresh_token no podemos renovar acceso a futuro.
      return NextResponse.redirect(new URL("/agenda?google=error", origin))
    }

    const expiry = tokens.expiry_date
      ? new Date(tokens.expiry_date)
      : new Date(Date.now() + 3_600_000)

    await prisma.doctor_google_tokens.upsert({
      where: { doctor_id: profile.id },
      update: {
        access_token: encryptToken(tokens.access_token),
        refresh_token: encryptToken(tokens.refresh_token),
        token_expiry: expiry,
        updated_at: new Date(),
      },
      create: {
        doctor_id: profile.id,
        access_token: encryptToken(tokens.access_token),
        refresh_token: encryptToken(tokens.refresh_token),
        token_expiry: expiry,
      },
    })

    return NextResponse.redirect(new URL("/agenda?google=connected", origin))
  } catch (err) {
    console.error("google oauth callback:", err)
    return NextResponse.redirect(new URL("/agenda?google=error", origin))
  }
}
