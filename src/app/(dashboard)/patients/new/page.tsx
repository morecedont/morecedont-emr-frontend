import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import NewPatientWizard from "./NewPatientWizard"

export default async function NewPatientPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  return <NewPatientWizard doctorId={profile.id} />
}
