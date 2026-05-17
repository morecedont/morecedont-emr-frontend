// Acceso al Google Calendar del doctor: refresh automático de token,
// persistencia cifrada y creación de eventos. Server-only.

import { google, type calendar_v3 } from "googleapis"
import { prisma } from "@/lib/prisma"
import { createOAuthClient } from "./oauth"
import { encryptToken, decryptToken } from "./crypto"

export async function isGoogleConnected(doctorId: string): Promise<boolean> {
  const row = await prisma.doctor_google_tokens.findUnique({
    where: { doctor_id: doctorId },
    select: { doctor_id: true },
  })
  return row !== null
}

async function getCalendarForDoctor(
  doctorId: string
): Promise<{ calendar: calendar_v3.Calendar; calendarId: string } | null> {
  const tokenRow = await prisma.doctor_google_tokens.findUnique({
    where: { doctor_id: doctorId },
  })
  if (!tokenRow) return null

  const client = createOAuthClient()
  client.setCredentials({
    access_token: decryptToken(tokenRow.access_token),
    refresh_token: decryptToken(tokenRow.refresh_token),
    expiry_date: tokenRow.token_expiry.getTime(),
  })

  // googleapis refresca el access_token solo y emite "tokens" — lo persistimos.
  client.on("tokens", (tokens) => {
    void prisma.doctor_google_tokens
      .update({
        where: { doctor_id: doctorId },
        data: {
          ...(tokens.access_token
            ? { access_token: encryptToken(tokens.access_token) }
            : {}),
          ...(tokens.refresh_token
            ? { refresh_token: encryptToken(tokens.refresh_token) }
            : {}),
          ...(tokens.expiry_date
            ? { token_expiry: new Date(tokens.expiry_date) }
            : {}),
          updated_at: new Date(),
        },
      })
      .catch((e) => console.error("persist refreshed google tokens:", e))
  })

  return {
    calendar: google.calendar({ version: "v3", auth: client }),
    calendarId: tokenRow.calendar_id,
  }
}

export async function createCalendarEvent(
  doctorId: string,
  input: {
    summary: string
    description?: string
    startISO: string
    durationMinutes: number
  }
): Promise<{ eventId: string } | { error: string }> {
  try {
    const ctx = await getCalendarForDoctor(doctorId)
    if (!ctx) return { error: "Doctor no conectado a Google Calendar" }

    const start = new Date(input.startISO)
    const end = new Date(start.getTime() + input.durationMinutes * 60_000)

    const res = await ctx.calendar.events.insert({
      calendarId: ctx.calendarId,
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
      },
    })

    const eventId = res.data.id
    if (!eventId) return { error: "Google no devolvió un event id" }
    return { eventId }
  } catch (err) {
    console.error("createCalendarEvent:", err)
    return {
      error: err instanceof Error ? err.message : "Error creando evento",
    }
  }
}
