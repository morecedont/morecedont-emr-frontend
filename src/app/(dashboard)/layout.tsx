import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import DashboardShell from "./components/DashboardShell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const profile = await getProfile()

  if (!profile) {
    redirect("/login")
  }

  return (
    <DashboardShell
      doctorName={profile.full_name}
      doctorRole={profile.specialty ?? profile.role}
    >
      {children}
    </DashboardShell>
  )
}
