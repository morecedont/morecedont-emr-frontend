"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import SharePatientModal from "./SharePatientModal"
import Pagination from "./Pagination"

export type PatientRow = {
  id: string
  fullName: string
  email: string | null
  phone: string | null
  idNumber: string | null
  lastVisitDate: string | null // ISO string
  clinicName: string | null
  status: "active" | "pending" | "inactive"
}

const AVATAR_CLASSES = [
  "bg-primary-fixed text-on-primary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-secondary-fixed-dim text-on-secondary-fixed",
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-fixed-dim text-on-primary-fixed",
]

function getAvatarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + hash * 31
  }
  return AVATAR_CLASSES[Math.abs(hash) % AVATAR_CLASSES.length]
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

function formatLastVisit(iso: string | null): string {
  if (!iso) return "—"
  try {
    return format(new Date(iso), "MMM dd, yyyy")
  } catch {
    return "—"
  }
}

function StatusBadge({ status }: { status: PatientRow["status"] }) {
  if (status === "active") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-green-100 text-green-700">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        Estable
      </span>
    )
  }
  if (status === "pending") {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-yellow-100 text-yellow-700">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
        Pendiente
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
      <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
      Inactivo
    </span>
  )
}

interface PatientsTableProps {
  patients: PatientRow[]
  totalCount: number
  totalPages: number
  currentPage: number
}

const PAGE_SIZE = 10

export default function PatientsTable({
  patients,
  totalCount,
  totalPages,
  currentPage,
}: PatientsTableProps) {
  const [sharePatient, setSharePatient] = useState<PatientRow | null>(null)

  if (patients.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        <div className="p-10 sm:p-16 flex flex-col items-center justify-center text-center gap-4">
          <span className="material-symbols-outlined text-outline text-5xl">
            person_search
          </span>
          <div>
            <p className="font-bold text-on-surface mb-1">
              Aún no tienes pacientes registrados
            </p>
            <p className="text-sm text-secondary">
              Agrega tu primer paciente para comenzar.
            </p>
          </div>
          <Link
            href="/patients/new"
            className="inline-flex items-center justify-center h-11 px-6 bg-primary text-white font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
          >
            Agregar paciente
          </Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden lg:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/40 border-b border-outline-variant/10">
              <tr>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Nombre completo
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Nº identificación
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Teléfono
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Última visita
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Clínica
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-6 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-[#F9FAFC] transition-colors cursor-pointer"
                >
                  {/* Full name + avatar */}
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarClass(patient.fullName)}`}
                      >
                        {getInitials(patient.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {patient.fullName}
                        </p>
                        {patient.email && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {patient.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  {/* ID number */}
                  <td className="px-6 py-5 text-sm font-medium text-gray-600">
                    {patient.idNumber
                      ? patient.idNumber.startsWith("#")
                        ? patient.idNumber
                        : `#${patient.idNumber}`
                      : "—"}
                  </td>
                  {/* Phone */}
                  <td className="px-6 py-5 text-sm text-gray-600">
                    {patient.phone ?? "—"}
                  </td>
                  {/* Last visit */}
                  <td className="px-6 py-5 text-sm text-gray-600 whitespace-nowrap">
                    {formatLastVisit(patient.lastVisitDate)}
                  </td>
                  {/* Clinic */}
                  <td className="px-6 py-5">
                    {patient.clinicName ? (
                      <span className="text-xs font-semibold px-2 py-1 bg-gray-100 text-gray-600 rounded-md">
                        {patient.clinicName}
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  {/* Status */}
                  <td className="px-6 py-5">
                    <StatusBadge status={patient.status} />
                  </td>
                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 hover:bg-surface-container rounded-md text-gray-400 hover:text-sidebar-active transition-all"
                        aria-label="Ver paciente"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </Link>
                      <button
                        onClick={() => setSharePatient(patient)}
                        className="p-1.5 hover:bg-surface-container rounded-md text-gray-400 hover:text-sidebar-active transition-all"
                        aria-label="Compartir historial"
                      >
                        <span className="material-symbols-outlined text-lg">
                          share
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Tablet table — hide phone + clinic */}
        <div className="hidden md:block lg:hidden overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container/40 border-b border-outline-variant/10">
              <tr>
                <th className="px-4 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Nombre completo
                </th>
                <th className="px-4 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Nº identificación
                </th>
                <th className="px-4 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Última visita
                </th>
                <th className="px-4 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest">
                  Estado
                </th>
                <th className="px-4 py-4 text-xs font-extrabold text-gray-400 uppercase tracking-widest text-right">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/10">
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className="hover:bg-[#F9FAFC] transition-colors"
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${getAvatarClass(patient.fullName)}`}
                      >
                        {getInitials(patient.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-on-surface truncate">
                          {patient.fullName}
                        </p>
                        {patient.email && (
                          <p className="text-[11px] text-gray-500 truncate">
                            {patient.email}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-600">
                    {patient.idNumber
                      ? patient.idNumber.startsWith("#")
                        ? patient.idNumber
                        : `#${patient.idNumber}`
                      : "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                    {formatLastVisit(patient.lastVisitDate)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={patient.status} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      <Link
                        href={`/patients/${patient.id}`}
                        className="p-1.5 hover:bg-surface-container rounded-md text-gray-400 hover:text-sidebar-active transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </Link>
                      <button
                        onClick={() => setSharePatient(patient)}
                        className="p-1.5 hover:bg-surface-container rounded-md text-gray-400 hover:text-sidebar-active transition-all"
                      >
                        <span className="material-symbols-outlined text-lg">
                          share
                        </span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-outline-variant/10">
          {patients.map((patient) => (
            <div key={patient.id} className="p-4 flex items-start gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarClass(patient.fullName)}`}
              >
                {getInitials(patient.fullName)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-on-surface truncate">
                      {patient.fullName}
                    </p>
                    {patient.idNumber && (
                      <p className="text-xs text-gray-500">
                        #{patient.idNumber}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={patient.status} />
                </div>
                <p className="text-xs text-secondary mt-1">
                  Última visita: {formatLastVisit(patient.lastVisitDate)}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Link
                    href={`/patients/${patient.id}`}
                    className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium border border-outline-variant/30 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      visibility
                    </span>
                    Ver
                  </Link>
                  <button
                    onClick={() => setSharePatient(patient)}
                    className="h-8 px-3 inline-flex items-center gap-1.5 text-xs font-medium border border-outline-variant/30 rounded-lg text-secondary hover:bg-surface-container transition-colors"
                  >
                    <span className="material-symbols-outlined text-[14px]">
                      share
                    </span>
                    Compartir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={PAGE_SIZE}
        />
      </div>

      {/* Share modal */}
      {sharePatient && (
        <SharePatientModal
          patientId={sharePatient.id}
          patientName={sharePatient.fullName}
          onClose={() => setSharePatient(null)}
        />
      )}
    </>
  )
}
