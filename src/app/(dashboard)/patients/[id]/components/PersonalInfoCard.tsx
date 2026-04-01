import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

const lbl = "text-xs text-gray-400 uppercase tracking-wide mb-0.5"
const val = "text-sm text-[#1E1E2F] font-medium"

export type PersonalInfo = {
  id: string
  fullName: string
  idNumber: string | null
  dateOfBirth: string | null
  gender: string | null
  address: string | null
}

export default function PersonalInfoCard({ patient }: { patient: PersonalInfo }) {
  const dob = patient.dateOfBirth
    ? format(new Date(patient.dateOfBirth), "dd/MM/yyyy", { locale: es })
    : "—"

  return (
    <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-on-surface">Información personal</h3>
        <Link
          href={`/patients/${patient.id}/edit`}
          className="text-xs font-semibold text-sidebar-active hover:underline"
        >
          Editar
        </Link>
      </div>
      <div className="space-y-3">
        <div>
          <p className={lbl}>Nombre completo</p>
          <p className={val}>{patient.fullName}</p>
        </div>
        <div>
          <p className={lbl}>DNI / ID</p>
          <p className={val}>{patient.idNumber ?? "—"}</p>
        </div>
        <div>
          <p className={lbl}>F. Nacimiento</p>
          <p className={val}>{dob}</p>
        </div>
        <div>
          <p className={lbl}>Género</p>
          <p className={val}>{patient.gender ?? "—"}</p>
        </div>
        <div>
          <p className={lbl}>Dirección</p>
          <p className={`${val} break-words`}>{patient.address ?? "—"}</p>
        </div>
      </div>
    </div>
  )
}
