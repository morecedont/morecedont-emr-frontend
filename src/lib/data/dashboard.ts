import { unstable_cache } from "next/cache"
import { prisma } from "@/lib/prisma"

export type DashboardClinicStat = { name: string; patient_count: number }
export type DashboardPatientStat = { patient_id: string; full_name: string; visit_count: number }

export type DashboardMetrics = {
  totalPatients: number
  topClinics: DashboardClinicStat[]
  topPatients: DashboardPatientStat[]
}

// Cached 60 s per doctor. Invalidate with revalidateTag(`dashboard-metrics-<doctorId>`)
// after patient creation or deletion.
export function getDashboardMetrics(doctorId: string): Promise<DashboardMetrics> {
  return unstable_cache(
    async () => {
      const [totalPatients, topClinics, topPatients] = await Promise.all([
        prisma.patients.count({ where: { current_doctor_id: doctorId } }),

        prisma.$queryRaw<DashboardClinicStat[]>`
          SELECT c.name, COUNT(DISTINCT p.id)::int AS patient_count
          FROM patients p
          JOIN medical_histories mh ON mh.patient_id = p.id
          JOIN clinics c ON c.id = mh.clinic_id
          WHERE p.current_doctor_id = ${doctorId}::uuid
            AND mh.clinic_id IS NOT NULL
          GROUP BY c.id, c.name
          ORDER BY patient_count DESC
          LIMIT 3
        `,

        prisma.$queryRaw<DashboardPatientStat[]>`
          SELECT p.id AS patient_id, p.full_name, COUNT(mh.id)::int AS visit_count
          FROM patients p
          JOIN medical_histories mh ON mh.patient_id = p.id
          WHERE p.current_doctor_id = ${doctorId}::uuid
          GROUP BY p.id, p.full_name
          ORDER BY visit_count DESC
          LIMIT 3
        `,
      ])

      return { totalPatients, topClinics, topPatients }
    },
    [`dashboard-metrics-${doctorId}`],
    { revalidate: 60, tags: [`dashboard-metrics-${doctorId}`] }
  )()
}
