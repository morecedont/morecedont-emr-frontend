import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export const getDoctorClinics = unstable_cache(
  async (doctorId: string) => {
    const rows = await prisma.doctor_clinics.findMany({
      where: { doctor_id: doctorId },
      include: { clinics: true },
    })
    return rows.map((dc) => ({
      id: dc.clinic_id,
      name: dc.clinics.name,
    }))
  },
  ["doctor-clinics"],
  { revalidate: 3600, tags: ["doctor-clinics"] }
)
