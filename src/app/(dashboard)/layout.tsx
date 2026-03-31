import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  return <div>{children}</div>
}
