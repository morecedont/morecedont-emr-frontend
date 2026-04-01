"use client"

import Link from "next/link"

export type RecentPatient = {
  id: string
  fullName: string
  idNumber: string | null
  lastVisit: string
  procedure: string | null
  isActive: boolean
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

interface RecentPatientsTableProps {
  patients: RecentPatient[]
}

export default function RecentPatientsTable({
  patients,
}: RecentPatientsTableProps) {
  if (patients.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base sm:text-lg font-bold text-brand-dark">
            Pacientes recientes
          </h3>
          <Link
            href="/patients"
            className="text-sm font-semibold text-sidebar-active hover:underline"
          >
            Ver todos
          </Link>
        </div>
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 p-10 sm:p-16 flex flex-col items-center justify-center text-center gap-4">
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
            className="inline-flex items-center justify-center h-11 px-6 bg-primary text-on-primary font-semibold rounded-lg hover:shadow-lg transition-all text-sm"
          >
            Agregar paciente
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-brand-dark">
          Pacientes recientes
        </h3>
        <Link
          href="/patients"
          className="text-sm font-semibold text-sidebar-active hover:underline"
        >
          Ver todos
        </Link>
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container/30">
            <tr>
              <th className="px-4 lg:px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider">
                Paciente
              </th>
              <th className="px-4 lg:px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider">
                Última visita
              </th>
              <th className="hidden md:table-cell px-4 lg:px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider">
                Procedimiento
              </th>
              <th className="px-4 lg:px-6 py-4 text-[11px] font-bold text-secondary uppercase tracking-wider text-right">
                Estado
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container/50">
            {patients.map((patient) => (
              <tr
                key={patient.id}
                className="hover:bg-surface-container-low transition-colors"
              >
                <td className="px-4 lg:px-6 py-4">
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
                      {patient.idNumber && (
                        <p className="text-[10px] text-outline">
                          ID: #{patient.idNumber}
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 lg:px-6 py-4 text-sm text-secondary whitespace-nowrap">
                  {patient.lastVisit}
                </td>
                <td className="hidden md:table-cell px-4 lg:px-6 py-4 text-sm text-secondary">
                  {patient.procedure ?? "—"}
                </td>
                <td className="px-4 lg:px-6 py-4 text-right">
                  {patient.isActive ? (
                    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">
                      activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-500">
                      inactivo
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-3">
        {patients.map((patient) => (
          <div
            key={patient.id}
            className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant/10 flex items-center gap-4"
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarClass(patient.fullName)}`}
            >
              {getInitials(patient.fullName)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-on-surface truncate">
                {patient.fullName}
              </p>
              <p className="text-xs text-secondary">{patient.lastVisit}</p>
              {patient.procedure && (
                <p className="text-xs text-outline truncate">{patient.procedure}</p>
              )}
            </div>
            {patient.isActive ? (
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700 shrink-0">
                activo
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500 shrink-0">
                inactivo
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
