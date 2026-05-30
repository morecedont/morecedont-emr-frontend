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

/** Estado de la integración + email de la cuenta de Google (si se capturó). */
export async function getGoogleConnection(
  doctorId: string
): Promise<{ connected: boolean; email: string | null }> {
  const row = await prisma.doctor_google_tokens.findUnique({
    where: { doctor_id: doctorId },
    select: { google_email: true },
  })
  return { connected: row !== null, email: row?.google_email ?? null }
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

export interface CalendarEventInput {
  summary: string
  description?: string
  startISO: string
  durationMinutes: number
  /** Email del paciente: si viene, se lo invita y Google le manda el evento. */
  attendeeEmail?: string
}

export async function createCalendarEvent(
  doctorId: string,
  input: CalendarEventInput
): Promise<{ eventId: string } | { error: string }> {
  try {
    const ctx = await getCalendarForDoctor(doctorId)
    if (!ctx) return { error: "Doctor no conectado a Google Calendar" }

    const start = new Date(input.startISO)
    const end = new Date(start.getTime() + input.durationMinutes * 60_000)

    const res = await ctx.calendar.events.insert({
      calendarId: ctx.calendarId,
      // sendUpdates: "all" → Google le envía la invitación por email al paciente.
      sendUpdates: input.attendeeEmail ? "all" : "none",
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: input.attendeeEmail
          ? [{ email: input.attendeeEmail }]
          : undefined,
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

export async function updateCalendarEvent(
  doctorId: string,
  eventId: string,
  input: CalendarEventInput
): Promise<{ eventId: string } | { error: string }> {
  try {
    const ctx = await getCalendarForDoctor(doctorId)
    if (!ctx) return { error: "Doctor no conectado a Google Calendar" }

    const start = new Date(input.startISO)
    const end = new Date(start.getTime() + input.durationMinutes * 60_000)

    // patch parcial: solo los campos que manejamos. Incluimos attendees para
    // mantener al paciente invitado; sendUpdates="all" le notifica el cambio.
    await ctx.calendar.events.patch({
      calendarId: ctx.calendarId,
      eventId,
      sendUpdates: input.attendeeEmail ? "all" : "none",
      requestBody: {
        summary: input.summary,
        description: input.description,
        start: { dateTime: start.toISOString() },
        end: { dateTime: end.toISOString() },
        attendees: input.attendeeEmail
          ? [{ email: input.attendeeEmail }]
          : undefined,
      },
    })

    return { eventId }
  } catch (err) {
    // Si el evento ya no existe en Google (borrado manual), lo tratamos como
    // "hay que recrearlo": lo señalamos para que el caller decida.
    if (isGoogleNotFound(err)) return { error: "not_found" }
    console.error("updateCalendarEvent:", err)
    return {
      error: err instanceof Error ? err.message : "Error actualizando evento",
    }
  }
}

export async function deleteCalendarEvent(
  doctorId: string,
  eventId: string
): Promise<{ ok: true } | { error: string }> {
  try {
    const ctx = await getCalendarForDoctor(doctorId)
    if (!ctx) return { error: "Doctor no conectado a Google Calendar" }

    await ctx.calendar.events.delete({
      calendarId: ctx.calendarId,
      eventId,
      // Notifica la cancelación al paciente invitado.
      sendUpdates: "all",
    })
    return { ok: true }
  } catch (err) {
    // Ya borrado en Google (404) o cancelado (410): el objetivo igual se cumplió.
    if (isGoogleNotFound(err)) return { ok: true }
    console.error("deleteCalendarEvent:", err)
    return {
      error: err instanceof Error ? err.message : "Error eliminando evento",
    }
  }
}

// googleapis tira GaxiosError con `.status`/`.code`. 404 = no existe, 410 = gone.
function isGoogleNotFound(err: unknown): boolean {
  const status = (err as { status?: number; code?: number } | null)?.status ??
    (err as { code?: number } | null)?.code
  return status === 404 || status === 410
}
