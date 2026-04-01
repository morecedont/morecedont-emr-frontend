import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import NewPatientWizard from "./NewPatientWizard"

export default async function NewPatientPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const doctorClinicsRaw = await prisma.doctor_clinics.findMany({
    where: { doctor_id: profile.id },
    include: { clinics: true },
  })

  const clinics = doctorClinicsRaw.map((dc) => ({
    id: dc.clinic_id,
    name: dc.clinics.name,
  }))

  return <NewPatientWizard doctorId={profile.id} clinics={clinics} />
}
