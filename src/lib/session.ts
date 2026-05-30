import { cache } from "react"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

// `cache` deduplica estas llamadas dentro de un mismo render pass:
// si el layout y la page (y cualquier componente server) llaman al mismo
// helper, se ejecuta UNA sola vez por request en vez de repetir el
// round-trip a Supabase Auth + la query a `profiles`.

export const getSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
})

export const getProfile = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const profile = await prisma.profiles.findUnique({
    where: { id: user.id },
  })

  return profile
})
