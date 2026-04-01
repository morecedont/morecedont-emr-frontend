"use server"

import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"

export async function searchDoctors(query: string) {
  const profile = await getProfile()
  if (!profile) return []

  const doctors = await prisma.profiles.findMany({
    where: {
      role: "doctor",
      status: "active",
      id: { not: profile.id },
      OR: [
        { full_name: { contains: query, mode: "insensitive" } },
        { email: { contains: query, mode: "insensitive" } },
      ],
    },
    select: {
      id: true,
      full_name: true,
      email: true,
      specialty: true,
    },
    take: 10,
  })

  return doctors
}

export async function sharePatient(
  patientId: string,
  targetDoctorId: string
): Promise<{ success: boolean; error?: string }> {
  const profile = await getProfile()
  if (!profile) return { success: false, error: "No autorizado" }

  // Check if already shared
  const existing = await prisma.doctor_patients.findUnique({
    where: {
      doctor_id_patient_id: {
        doctor_id: targetDoctorId,
        patient_id: patientId,
      },
    },
  })

  if (existing) {
    return {
      success: false,
      error: "Este doctor ya tiene acceso a este paciente",
    }
  }

  await prisma.doctor_patients.create({
    data: {
      doctor_id: targetDoctorId,
      patient_id: patientId,
      shared_by: profile.id,
      shared_at: new Date(),
    },
  })

  return { success: true }
}
