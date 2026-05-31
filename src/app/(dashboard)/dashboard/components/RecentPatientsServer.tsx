import { prisma } from "@/lib/prisma"
import RecentPatientsTable, { type RecentPatient } from "./RecentPatientsTable"

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

export default async function RecentPatientsServer({ doctorId }: { doctorId: string }) {
  const raw = await prisma.doctor_patients.findMany({
    relationLoadStrategy: "join",
    where: { doctor_id: doctorId },
    include: {
      patients: {
        include: {
          medical_histories: {
            where: { doctor_id: doctorId },
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
  })

  const patients: RecentPatient[] = raw.map((dp) => {
    const lastHistory = dp.patients.medical_histories[0] ?? null
    const lastVisitDate = lastHistory?.created_at ?? null
    return {
      id: dp.patient_id,
      fullName: dp.patients.full_name,
      idNumber: dp.patients.id_number ?? null,
      lastVisit: formatDate(lastVisitDate),
      procedure: lastHistory?.treatment_items[0]?.description ?? null,
      isActive: isActivePatient(lastVisitDate),
    }
  })

  return <RecentPatientsTable patients={patients} />
}
