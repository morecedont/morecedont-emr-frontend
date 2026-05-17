// OAuth — inicio del consent. GET porque Google necesita un redirect target;
// las mutaciones de negocio siguen en Server Actions (excepción de protocolo).

import { NextResponse } from "next/server"
import { getProfile } from "@/lib/session"
import { getAuthUrl, signState } from "@/lib/google/oauth"

export async function GET(request: Request) {
  const origin = new URL(request.url).origin
  const profile = await getProfile()
  if (!profile) {
    return NextResponse.redirect(new URL("/login", origin))
  }
  return NextResponse.redirect(getAuthUrl(signState(profile.id)))
}
