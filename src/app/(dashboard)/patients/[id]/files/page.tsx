import { notFound, redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getPatientAttachmentsWithUrls } from "@/lib/actions/attachments"
import PatientFilesGallery from "./PatientFilesGallery"

export default async function PatientFilesPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const access = await prisma.doctor_patients.findUnique({
    where: {
      doctor_id_patient_id: {
        doctor_id: profile.id,
        patient_id: id,
      },
    },
  })
  if (!access) notFound()

  const patient = await prisma.patients.findUnique({
    where: { id },
    select: { full_name: true, id: true },
  })
  if (!patient) notFound()

  const result = await getPatientAttachmentsWithUrls(id)
  const attachments = result.attachments ?? []

  return (
    <PatientFilesGallery
      patient={patient}
      attachments={attachments}
      patientId={id}
    />
  )
}
