import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import PatientEditForm from "./PatientEditForm"

export default async function EditPatientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const profile = await getProfile()
  if (!profile) redirect("/login")

  const access = await prisma.doctor_patients.findUnique({
    where: { doctor_id_patient_id: { doctor_id: profile.id, patient_id: id } },
  })
  if (!access) notFound()

  const patient = await prisma.patients.findUnique({ where: { id } })
  if (!patient) notFound()

  return (
    <div className="min-h-screen bg-surface-container-low">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-1.5 text-xs font-medium text-secondary max-w-4xl mx-auto">
          <Link href="/patients" className="hover:text-sidebar-active transition-colors">
            Pacientes
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link href={`/patients/${id}`} className="hover:text-sidebar-active transition-colors">
            {patient.full_name}
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-on-surface font-semibold">Editar datos</span>
        </nav>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
          <div className="p-6 sm:p-8 border-b border-surface-container">
            <h1 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
              Editar datos del paciente
            </h1>
            <p className="text-secondary mt-1 text-sm">
              Actualice la información personal de {patient.full_name}.
            </p>
          </div>

          <PatientEditForm
            patientId={id}
            initialData={{
              fullName: patient.full_name,
              idNumber: patient.id_number ?? "",
              dateOfBirth: patient.date_of_birth
                ? patient.date_of_birth.toISOString().substring(0, 10)
                : "",
              gender: patient.gender ?? "",
              bloodType: patient.blood_type ?? "",
              phone: patient.phone ?? "",
              email: patient.email ?? "",
              address: patient.address ?? "",
            }}
          />
        </div>
      </div>
    </div>
  )
}
