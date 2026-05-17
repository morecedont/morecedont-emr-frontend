"use server"

import { revalidatePath } from "next/cache"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function disconnectGoogle(): Promise<{
  error?: string
  success?: boolean
}> {
  const profile = await getProfile()
  if (!profile) return { error: "No autorizado" }

  try {
    await prisma.doctor_google_tokens.deleteMany({
      where: { doctor_id: profile.id },
    })
    revalidatePath("/agenda")
    return { success: true }
  } catch (err) {
    console.error("disconnectGoogle:", err)
    return { error: "No se pudo desconectar Google Calendar" }
  }
}
