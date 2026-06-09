import { cache } from "react"
import { unstable_cache } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export const getSession = cache(async () => {
  const supabase = await createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
})

// JWT validation — per-request. React cache() deduplicates within a render pass.
const getUser = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
})

// Prisma fetch cached 5 min per user ID across requests.
// Invalidate with revalidateTag(`profile-<id>`) when admin approves/rejects.
function fetchProfileFromDB(userId: string) {
  return unstable_cache(
    () => prisma.profiles.findUnique({ where: { id: userId } }),
    [`profile-${userId}`],
    { revalidate: 300, tags: [`profile-${userId}`] }
  )()
}

export const getProfile = cache(async () => {
  const user = await getUser()
  if (!user) return null
  return fetchProfileFromDB(user.id)
})
