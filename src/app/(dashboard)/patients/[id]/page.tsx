import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { getSignedUrls } from "@/lib/storage"
import { cleanupOrphanedDrafts } from "@/lib/actions/patients"
import PatientProfileHeader, { type PatientHeaderData } from "./components/PatientProfileHeader"
import TreatmentHistoryList, { type HistoryRow } from "./components/TreatmentHistoryList"
import PatientAlertsDocuments, { type AlertData, type AttachmentData } from "./components/PatientAlertsDocuments"
import PersonalInfoCard, { type PersonalInfo } from "./components/PersonalInfoCard"
import EmergencyContactCard, { type EmergencyInfo } from "./components/EmergencyContactCard"
import ClinicalInfoCard, { type ClinicalInfo } from "./components/ClinicalInfoCard"

const HISTORY_PAGE_SIZE = 5

function calcAge(dob: Date | null | undefined): number | null {
  if (!dob) return null
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const m = today.getMonth() - dob.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--
  return age
}

function deriveStatus(createdAt: Date, dbStatus: string): "active" | "completed" | "paused" | "draft" {
  if (dbStatus === "draft") return "draft"
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
  return createdAt >= sixMonthsAgo ? "active" : "completed"
}

export default async function PatientPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ historyPage?: string }>
}) {
  const { id } = await params
  const resolvedSearchParams = await searchParams
  const profile = await getProfile()
  if (!profile) redirect("/login")
  const currentHistoryPage = Math.max(1, parseInt(resolvedSearchParams.historyPage ?? "1", 10))

  const ownership = await prisma.patients.findFirst({
    where: {
      id,
      OR: [
        { current_doctor_id: profile.id },
        { medical_histories: { some: { doctor_id: profile.id } } },
      ],
    },
    select: { current_doctor_id: true },
  })
  if (!ownership) notFound()

  await cleanupOrphanedDrafts(id)

  const [patient, totalActiveCount, draftHistories, attachmentsRaw] = await Promise.all([
    prisma.patients.findUnique({
      relationLoadStrategy: "join",
      where: { id },
      include: {
        medical_histories: {
          where: { status: "active" },
          orderBy: { created_at: "desc" },
          skip: (currentHistoryPage - 1) * HISTORY_PAGE_SIZE,
          take: HISTORY_PAGE_SIZE,
          include: {
            clinics: true,
            treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
            medical_backgrounds: { select: { immun_drug_allergy: true, blood_easy_bleeding: true } },
          },
        },
      },
    }),
    prisma.medical_histories.count({
      where: { patient_id: id, status: "active" },
    }),
    prisma.medical_histories.findMany({
      where: { patient_id: id, doctor_id: profile.id, status: "draft" },
      orderBy: { created_at: "desc" },
      include: {
        clinics: true,
        treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
      },
    }),
    prisma.attachments.findMany({
      relationLoadStrategy: "join",
      where: {
        medical_histories: { patient_id: id },
      },
      include: {
        medical_histories: {
          select: {
            id: true,
            created_at: true,
            clinics: { select: { name: true } },
          },
        },
      },
      orderBy: { uploaded_at: "desc" },
      take: 3,
    }),
  ])
  if (!patient) notFound()

  // Derive header data
  const latestHistory = patient.medical_histories[0] ?? null
  const isActive = latestHistory
    ? latestHistory.created_at >= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
    : false

  const headerData: PatientHeaderData = {
    id: patient.id,
    fullName: patient.full_name,
    age: calcAge(patient.date_of_birth),
    bloodType: patient.blood_type ?? null,
    phone: patient.phone ?? null,
    isActive,
    firstVisitPending: patient.status === "pending_first_visit",
  }

  // History rows — active (paginated)
  const histories: HistoryRow[] = patient.medical_histories.map((h) => ({
    id: h.id,
    patientId: patient.id,
    clinicName: h.clinics?.name ?? null,
    firstProcedure: h.treatment_items[0]?.description ?? null,
    createdAt: h.created_at.toISOString(),
    status: deriveStatus(h.created_at, h.status),
  }))

  // Draft rows — shown separately above the active list
  const draftRows: HistoryRow[] = draftHistories.map((h) => ({
    id: h.id,
    patientId: patient.id,
    clinicName: h.clinics?.name ?? null,
    firstProcedure: h.treatment_items[0]?.description ?? null,
    createdAt: h.created_at.toISOString(),
    status: "draft" as const,
  }))

  const totalHistoryPages = Math.max(1, Math.ceil(totalActiveCount / HISTORY_PAGE_SIZE))

  // Alerts
  const bg = latestHistory?.medical_backgrounds
  const alertData: AlertData = {
    hasAllergy: bg?.immun_drug_allergy ?? false,
    hasEasyBleeding: bg?.blood_easy_bleeding ?? false,
    createdAt: latestHistory?.created_at.toISOString() ?? null,
  }

  // Attachments with signed URLs
  const signedUrlMap = await getSignedUrls(attachmentsRaw.map((a) => a.file_url))
  const attachments: AttachmentData[] = attachmentsRaw.map((a) => ({
    id: a.id,
    fileName: a.description ?? a.file_url.split("/").pop() ?? a.file_url,
    fileType: a.file_type ?? null,
    uploadedAt: a.uploaded_at.toISOString(),
    signedUrl: signedUrlMap[a.file_url] ?? null,
    historyId: a.medical_histories.id,
  }))

  // Sidebar info
  const personalInfo: PersonalInfo = {
    id: patient.id,
    fullName: patient.full_name,
    idNumber: patient.id_number ?? null,
    dateOfBirth: patient.date_of_birth?.toISOString() ?? null,
    gender: patient.gender ?? null,
    occupation: patient.occupation ?? null,
    address: patient.address ?? null,
  }

  const emergencyInfo: EmergencyInfo = {
    emergencyContact: latestHistory?.emergency_contact ?? null,
  }

  const clinicalInfo: ClinicalInfo = {
    lastVisit: latestHistory?.last_dental_visit?.toISOString() ?? latestHistory?.created_at.toISOString() ?? null,
    preferredClinic: latestHistory?.clinics?.name ?? null,
    preferredClinicId: latestHistory?.clinics?.id ?? null,
    currency: latestHistory?.currency ?? "USD",
  }

  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-secondary">
          <Link href="/patients" className="hover:text-sidebar-active transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">{patient.full_name}</span>
        </nav>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <PatientProfileHeader patient={headerData} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: 2/3 */}
          <div className="lg:col-span-2 space-y-6">
            <TreatmentHistoryList
              histories={histories}
              draftHistories={draftRows}
              patientId={id}
              currentPage={currentHistoryPage}
              totalPages={totalHistoryPages}
              totalCount={totalActiveCount}
              pageSize={HISTORY_PAGE_SIZE}
            />
            <PatientAlertsDocuments alerts={alertData} attachments={attachments} patientId={id} />
          </div>

          {/* Right: 1/3 */}
          <div className="space-y-4">
            <PersonalInfoCard patient={personalInfo} />
            <EmergencyContactCard patient={emergencyInfo} />
            <ClinicalInfoCard
              info={clinicalInfo}
              patientId={id}
              doctorId={profile.id}
              hasHistory={!!latestHistory}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
