// Cliente OAuth2 web de Google + helpers de state (CSRF).
// Server-only.

import { google } from "googleapis"
import crypto from "crypto"

// Scope de calendario imprescindible: sin él no podemos crear/editar eventos.
// Google puede NO concederlo (usuario no aprueba el permiso, app en Testing sin
// el scope registrado, etc.), así que el callback lo valida explícitamente.
export const CALENDAR_EVENTS_SCOPE =
  "https://www.googleapis.com/auth/calendar.events"

// Lectura/escritura de eventos del calendario del doctor + email de la cuenta
// (openid/userinfo.email) para mostrar con qué correo quedó integrado.
const SCOPES = [
  CALENDAR_EVENTS_SCOPE,
  "openid",
  "https://www.googleapis.com/auth/userinfo.email",
]

/** True si la lista de scopes concedidos incluye el de eventos de calendario. */
export function grantedCalendarScope(scope?: string | null): boolean {
  if (!scope) return false
  return scope.split(" ").includes(CALENDAR_EVENTS_SCOPE)
}

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

/**
 * Email de la cuenta de Google que autorizó. Lo saca del id_token (firmado por
 * Google, verificado contra sus certs). Devuelve null si no vino el scope email.
 */
export async function getGoogleEmail(idToken?: string | null): Promise<string | null> {
  if (!idToken) return null
  try {
    const ticket = await createOAuthClient().verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })
    return ticket.getPayload()?.email ?? null
  } catch (err) {
    console.error("getGoogleEmail:", err)
    return null
  }
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
