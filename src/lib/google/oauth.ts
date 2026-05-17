// Cliente OAuth2 web de Google + helpers de state (CSRF).
// Server-only.

import { google } from "googleapis"
import crypto from "crypto"

// Lectura/escritura de eventos del calendario del doctor.
const SCOPES = ["https://www.googleapis.com/auth/calendar.events"]

export function createOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  )
}

export function getAuthUrl(state: string): string {
  return createOAuthClient().generateAuthUrl({
    access_type: "offline", // necesario para obtener refresh_token
    prompt: "consent", // fuerza refresh_token incluso en re-conexiones
    scope: SCOPES,
    include_granted_scopes: true,
    state,
  })
}

export async function exchangeCode(code: string) {
  const { tokens } = await createOAuthClient().getToken(code)
  return tokens
}

// ─── State anti-CSRF: HMAC(doctorId) con AUTH_SECRET ──────────────────────────

export function signState(doctorId: string): string {
  const mac = crypto
    .createHmac("sha256", process.env.AUTH_SECRET ?? "")
    .update(doctorId)
    .digest("base64url")
  return `${doctorId}.${mac}`
}

export function verifyState(state: string, expectedDoctorId: string): boolean {
  const expected = signState(expectedDoctorId)
  const a = Buffer.from(state)
  const b = Buffer.from(expected)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
