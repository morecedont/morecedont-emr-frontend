"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: error.message }
  }

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
