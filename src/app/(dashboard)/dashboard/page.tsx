import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import StatsCards from "./components/StatsCards"
import RecentPatientsTable, { type RecentPatient } from "./components/RecentPatientsTable"
import ClinicalTimeline from "./components/ClinicalTimeline"

function formatDate(date: Date | null | undefined): string {
  if (!date) return "—"
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }).format(date)
}

function isActivePatient(lastVisitDate: Date | null | undefined): boolean {
  if (!lastVisitDate) return false
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return lastVisitDate >= sixMonthsAgo
}

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [totalPatients, recentConsultations, recentPatientsRaw] =
    await Promise.all([
      prisma.doctor_patients.count({
        where: { doctor_id: profile.id },
      }),
      prisma.medical_histories.count({
        where: {
          doctor_id: profile.id,
          created_at: { gte: thirtyDaysAgo },
        },
      }),
      prisma.doctor_patients.findMany({
        where: { doctor_id: profile.id },
        include: {
          patients: {
            include: {
              medical_histories: {
                where: { doctor_id: profile.id },
                orderBy: { created_at: "desc" },
                take: 1,
                include: {
                  treatment_items: {
                    orderBy: { item_number: "asc" },
                    take: 1,
                  },
                },
              },
            },
          },
        },
        orderBy: { shared_at: "desc" },
        take: 4,
      }),
    ])

  // Map to plain serializable objects before passing to Client Components
  const recentPatients: RecentPatient[] = recentPatientsRaw.map((dp) => {
    const lastHistory = dp.patients.medical_histories[0] ?? null
    const lastVisitDate = lastHistory?.created_at ?? null
    const procedure = lastHistory?.treatment_items[0]?.description ?? null

    return {
      id: dp.patient_id,
      fullName: dp.patients.full_name,
      idNumber: dp.patients.id_number ?? null,
      lastVisit: formatDate(lastVisitDate),
      procedure,
      isActive: isActivePatient(lastVisitDate),
    }
  })

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <StatsCards
        totalPatients={totalPatients}
        recentConsultations={recentConsultations}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <RecentPatientsTable patients={recentPatients} />
        </div>
        <div>
          <ClinicalTimeline />
        </div>
      </div>
    </div>
  )
}
