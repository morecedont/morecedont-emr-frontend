import { format } from "date-fns"
import { es } from "date-fns/locale"

const lbl = "text-xs text-gray-400 uppercase tracking-wide mb-0.5"
const val = "text-sm text-[#1E1E2F] font-medium"

export type ClinicalInfo = {
  lastVisit: string | null
  preferredClinic: string | null
  currency: string | null
}

export default function ClinicalInfoCard({ info }: { info: ClinicalInfo }) {
  const lastVisit = info.lastVisit
    ? format(new Date(info.lastVisit), "dd/MM/yyyy", { locale: es })
    : "—"

  return (
    <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">Información clínica</h3>
      <div className="space-y-3">
        <div>
          <p className={lbl}>Última visita</p>
          <p className={val}>{lastVisit}</p>
        </div>
        <div>
          <p className={lbl}>Clínica preferida</p>
          <p className={val}>{info.preferredClinic ?? "—"}</p>
        </div>
        <div>
          <p className={lbl}>Moneda preferida</p>
          <p className={val}>{info.currency ?? "USD"}</p>
        </div>
      </div>
    </div>
  )
}
