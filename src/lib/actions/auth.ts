"use server"

import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

async function getOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
  const h = await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000"
  const proto = h.get("x-forwarded-proto") ?? "http"
  return `${proto}://${host}`
}

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

  const profile = await prisma.profiles.findUnique({
    where: { id: data.user.id },
    select: { status: true },
  })

  if (profile?.status === "pending") redirect("/register/pending")
  if (profile?.status === "rejected") redirect("/register/rejected")

  redirect("/dashboard")
}

export type SignUpData = {
  fullName: string
  email: string
  phone: string
  password: string
  licenseNumber: string
  specialty: string
}

export async function signUp(data: SignUpData) {
  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  })

  if (error) {
    return { error: error.message }
  }

  if (!authData.user) {
    return { error: "No se pudo crear el usuario. Intenta de nuevo." }
  }

  try {
    await prisma.profiles.create({
      data: {
        id: authData.user.id,
        full_name: data.fullName,
        email: data.email,
        phone: data.phone || null,
        license_number: data.licenseNumber,
        specialty: data.specialty,
        role: "doctor",
        status: "pending",
      },
    })
  } catch {
    return { error: "Error al guardar el perfil. Contacta a soporte." }
  }

  redirect("/register/pending")
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

/**
 * Envía el email de recuperación. Respuesta neutra siempre: no revela
 * si el email está o no registrado (evita enumeración de usuarios).
 */
export async function requestPasswordReset(
  email: string
): Promise<{ ok: true }> {
  const trimmed = email.trim()
  if (trimmed) {
    try {
      const supabase = await createClient()
      const origin = await getOrigin()
      await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: `${origin}/auth/confirm`,
      })
    } catch (err) {
      // No propagamos: la respuesta debe ser indistinguible.
      console.error("requestPasswordReset:", err)
    }
  }
  return { ok: true }
}

/**
 * Establece la nueva contraseña. Requiere una sesión de recovery activa
 * (la deja el route handler /auth/confirm tras validar el token del email).
 */
export async function updatePassword(
  password: string
): Promise<{ error?: string }> {
  if (!password || password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres" }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return {
      error: "El enlace expiró o no es válido. Solicitá uno nuevo.",
    }
  }

  const { error } = await supabase.auth.updateUser({ password })
  if (error) {
    return { error: error.message }
  }

  redirect("/dashboard")
}
