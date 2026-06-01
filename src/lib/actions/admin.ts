"use server"

import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { prisma } from "@/lib/prisma"
import { getProfile } from "@/lib/session"
import { sendWelcomeEmail } from "@/lib/resend"

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

export async function approveDoctor(
  doctorId: string
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") return { error: "No autorizado" }

  const doctor = await prisma.profiles.findUnique({ where: { id: doctorId } })
  if (!doctor) return { error: "Doctor no encontrado" }
  if (doctor.status === "active") return { error: "El doctor ya está activo" }

  await prisma.profiles.update({
    where: { id: doctorId },
    data: { status: "active" },
  })

  try {
    const origin = await getOrigin()
    await sendWelcomeEmail({
      to: doctor.email,
      doctorName: doctor.full_name,
      specialty: doctor.specialty ?? "Odontología General",
      loginUrl: `${origin}/login`,
    })
  } catch (err) {
    console.error("approveDoctor — email error:", err)
    // El status ya fue actualizado; no revertimos por fallo de email.
  }

  revalidatePath("/solicitudes")
  return {}
}

export async function rejectDoctor(
  doctorId: string,
  reason?: string
): Promise<{ error?: string }> {
  const profile = await getProfile()
  if (!profile || profile.role !== "admin") return { error: "No autorizado" }

  const doctor = await prisma.profiles.findUnique({ where: { id: doctorId } })
  if (!doctor) return { error: "Doctor no encontrado" }

  await prisma.profiles.update({
    where: { id: doctorId },
    data: {
      status: "rejected",
      rejection_reason: reason ?? null,
    },
  })

  revalidatePath("/solicitudes")
  return {}
}
