import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export async function getSession() {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

export async function getProfile() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  })

  return profile
}
