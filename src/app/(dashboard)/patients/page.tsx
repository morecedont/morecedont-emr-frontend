import { redirect } from "next/navigation"
import { Prisma } from "@prisma/client"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getDoctorClinics } from "@/lib/data/clinics"
import PatientsTable, { type PatientRow } from "./components/PatientsTable"
import PatientsFilters from "./components/PatientsFilters"
import BottomStatsCards from "./components/BottomStatsCards"

const PAGE_SIZE = 10

function deriveStatus(
  lastVisitDate: Date | null | undefined
): PatientRow["status"] {
  if (!lastVisitDate) return "pending"
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return lastVisitDate >= sixMonthsAgo ? "active" : "inactive"
}

interface PatientsPageProps {
  searchParams: Promise<{
    page?: string
    clinic?: string
    search?: string
    status?: string
  }>
}

export default async function PatientsPage({
  searchParams,
}: PatientsPageProps) {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const params = await searchParams
  const currentPage = Math.max(1, parseInt(params.page ?? "1", 10))
  const clinicFilter = params.clinic ?? ""
  const searchQuery = params.search ?? ""
  const statusFilter = params.status ?? ""

  // Build where clause
  const baseWhere = {
    current_doctor_id: profile.id,
  } satisfies Prisma.patientsWhereInput

  const searchWhere: Prisma.patientsWhereInput = searchQuery
    ? {
        OR: [
          { full_name: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { id_number: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
          { email: { contains: searchQuery, mode: Prisma.QueryMode.insensitive } },
        ],
      }
    : {}

  const where: Prisma.patientsWhereInput = { ...baseWhere, ...searchWhere }

  const [patientsRaw, totalCount, doctorClinics] = await Promise.all([
    prisma.patients.findMany({
      relationLoadStrategy: "join",
      where,
      include: {
        medical_histories: {
          orderBy: { created_at: "desc" },
          take: 1,
          include: {
            clinics: true,
            treatment_items: {
              orderBy: { item_number: "asc" },
              take: 1,
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.patients.count({ where }),
    getDoctorClinics(profile.id),
  ])

  // Map to plain serializable objects
  let patients: PatientRow[] = patientsRaw.map((p) => {
    const lastHistory = p.medical_histories[0] ?? null
    const lastVisitDate = lastHistory?.created_at ?? null
    const clinicName = lastHistory?.clinics?.name ?? null

    return {
      id: p.id,
      fullName: p.full_name,
      email: p.email ?? null,
      phone: p.phone ?? null,
      idNumber: p.id_number ?? null,
      lastVisitDate: lastVisitDate ? lastVisitDate.toISOString() : null,
      clinicName,
      // El estado "primera consulta pendiente" (columna DB) tiene prioridad
      // sobre el estado derivado por inactividad de visitas.
      status:
        p.status === "pending_first_visit"
          ? "first_visit_pending"
          : deriveStatus(lastVisitDate),
    }
  })

  // Apply clinic filter (post-fetch since clinic is on medical_history)
  if (clinicFilter) {
    const clinicData = doctorClinics.find((dc) => dc.id === clinicFilter)
    if (clinicData) {
      patients = patients.filter((p) => p.clinicName === clinicData.name)
    }
  }

  // Apply status filter (post-fetch)
  if (statusFilter === "active" || statusFilter === "pending" || statusFilter === "inactive") {
    patients = patients.filter((p) => p.status === statusFilter)
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-on-surface">
            Pacientes
          </h1>
          <p className="text-sm text-secondary mt-0.5">
            {totalCount} paciente{totalCount !== 1 ? "s" : ""} registrado
            {totalCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5">
        <PatientsFilters clinics={doctorClinics} />
      </div>

      {/* Table */}
      <PatientsTable
        patients={patients}
        totalCount={totalCount}
        totalPages={totalPages}
        currentPage={currentPage}
      />

      {/* Bottom stats cards */}
      <BottomStatsCards
        doctorId={profile.id}
        totalPatients={totalCount}
      />
    </div>
  )
}
