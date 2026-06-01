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
  const raw = await prisma.patients.findMany({
    relationLoadStrategy: "join",
    where: { current_doctor_id: doctorId },
    include: {
      medical_histories: {
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
    orderBy: { created_at: "desc" },
    take: 4,
  })

  const patients: RecentPatient[] = raw.map((p) => {
    const lastHistory = p.medical_histories[0] ?? null
    const lastVisitDate = lastHistory?.created_at ?? null
    return {
      id: p.id,
      fullName: p.full_name,
      idNumber: p.id_number ?? null,
      lastVisit: formatDate(lastVisitDate),
      procedure: lastHistory?.treatment_items[0]?.description ?? null,
      isActive: isActivePatient(lastVisitDate),
    }
  })

  return <RecentPatientsTable patients={patients} />
}
