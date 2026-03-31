import { getProfile } from "@/lib/session"

export default async function DashboardPage() {
  const profile = await getProfile()

  return (
    <div>
      <h1>Bienvenido, {profile?.full_name}</h1>
    </div>
  )
}
