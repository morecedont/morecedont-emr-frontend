import { redirect, notFound } from "next/navigation"
import { getProfile } from "@/lib/session"
import { createMedicalHistory } from "@/lib/actions/patients"
import { prisma } from "@/lib/prisma"

export default async function NewHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect("/login")

  // Verify doctor has access
  const access = await prisma.doctor_patients.findUnique({
    where: { doctor_id_patient_id: { doctor_id: profile.id, patient_id: id } },
  })
  if (!access) notFound()

  // Get preferred clinic
  const latestHistory = await prisma.medical_histories.findFirst({
    where: { patient_id: id, doctor_id: profile.id },
    orderBy: { created_at: "desc" },
    select: { clinic_id: true, currency: true },
  })

  const result = await createMedicalHistory(
    id,
    latestHistory?.clinic_id ?? null,
    (latestHistory?.currency as "USD" | "VES" | "EUR") ?? "USD"
  )

  if (result.error || !result.medicalHistoryId) {
    redirect(`/patients/${id}`)
  }

  redirect(`/patients/${id}/history/${result.medicalHistoryId}`)
}
