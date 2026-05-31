import { prisma } from "@/lib/prisma"
import StatsCards from "./StatsCards"

export default async function StatsCardsServer({ doctorId }: { doctorId: string }) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalPatients, recentConsultations] = await Promise.all([
    prisma.doctor_patients.count({ where: { doctor_id: doctorId } }),
    prisma.medical_histories.count({
      where: { doctor_id: doctorId, created_at: { gte: thirtyDaysAgo } },
    }),
  ])

  return (
    <StatsCards
      totalPatients={totalPatients}
      recentConsultations={recentConsultations}
    />
  )
}
