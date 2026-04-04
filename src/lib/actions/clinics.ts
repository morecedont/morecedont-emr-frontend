"use server"

import { prisma } from "@/lib/prisma"
import { getProfile } from "@/lib/session"
import { Prisma } from "@prisma/client"

export async function searchClinics(query: string) {
  const profile = await getProfile()
  if (!profile) throw new Error("Unauthorized")
  if (!query || query.trim().length < 1) return []

  const clinics = await prisma.clinics.findMany({
    where: {
      name: { contains: query.trim(), mode: Prisma.QueryMode.insensitive },
    },
    include: {
      doctor_clinics: {
        where: { doctor_id: profile.id },
        select: { doctor_id: true },
      },
    },
    orderBy: { name: "asc" },
    take: 10,
  })

  return clinics
    .map((clinic) => ({
      id: clinic.id,
      name: clinic.name,
      address: clinic.address,
      phone: clinic.phone,
      isOwn: clinic.doctor_clinics.length > 0,
    }))
    .sort((a, b) => (b.isOwn ? 1 : 0) - (a.isOwn ? 1 : 0))
}

export async function createClinic(data: {
  name: string
  address?: string
  phone?: string
}): Promise<{
  clinic?: { id: string; name: string; address: string | null; phone: string | null }
  warning?: string
  error?: string
}> {
  const profile = await getProfile()
  if (!profile) throw new Error("Unauthorized")
  if (!data.name?.trim()) return { error: "El nombre de la clínica es requerido" }

  const existing = await prisma.clinics.findFirst({
    where: { name: { equals: data.name.trim(), mode: Prisma.QueryMode.insensitive } },
  })

  if (existing) {
    await prisma.doctor_clinics.upsert({
      where: { doctor_id_clinic_id: { doctor_id: profile.id, clinic_id: existing.id } },
      update: {},
      create: { doctor_id: profile.id, clinic_id: existing.id },
    })
    return {
      clinic: { id: existing.id, name: existing.name, address: existing.address, phone: existing.phone },
      warning: "Esta clínica ya existe. Se ha asociado a tu cuenta.",
    }
  }

  const clinic = await prisma.clinics.create({
    data: {
      name: data.name.trim(),
      address: data.address?.trim() || null,
      phone: data.phone?.trim() || null,
      created_by: profile.id,
    },
  })

  await prisma.doctor_clinics.create({
    data: { doctor_id: profile.id, clinic_id: clinic.id },
  })

  return {
    clinic: { id: clinic.id, name: clinic.name, address: clinic.address, phone: clinic.phone },
  }
}

export async function associateClinic(clinicId: string) {
  const profile = await getProfile()
  if (!profile) throw new Error("Unauthorized")

  await prisma.doctor_clinics.upsert({
    where: { doctor_id_clinic_id: { doctor_id: profile.id, clinic_id: clinicId } },
    update: {},
    create: { doctor_id: profile.id, clinic_id: clinicId },
  })
}
