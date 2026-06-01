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

  const [ownership, latestHistory] = await Promise.all([
    prisma.patients.findUnique({
      where: { id },
      select: { current_doctor_id: true },
    }),
    prisma.medical_histories.findFirst({
      where: { patient_id: id },
      orderBy: { created_at: "desc" },
      select: { clinic_id: true, currency: true },
    }),
  ])
  if (!ownership || ownership.current_doctor_id !== profile.id) notFound()

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
