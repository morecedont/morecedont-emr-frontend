import Link from "next/link"
import { getDashboardMetrics } from "@/lib/data/dashboard"

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

const AVATAR_COLORS = [
  "bg-blue-100 text-blue-700",
  "bg-violet-100 text-violet-700",
  "bg-teal-surface text-teal-accent",
  "bg-amber-50 text-amber-600",
  "bg-rose-100 text-rose-700",
]

function avatarColor(name: string): string {
  const code = name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[code % AVATAR_COLORS.length]
}

export default async function BottomMetricsServer({ doctorId }: { doctorId: string }) {
  const { totalPatients, topClinics, topPatients } = await getDashboardMetrics(doctorId)

  const maxClinicCount = topClinics[0]?.patient_count ?? 1

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">

      {/* Card 1 — Total pacientes */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary text-[20px]">groups</span>
          </div>
          <Link
            href="/patients"
            className="text-[11px] font-semibold text-secondary hover:text-primary transition-colors flex items-center gap-0.5"
          >
            Ver todos
            <span className="material-symbols-outlined text-[13px]">chevron_right</span>
          </Link>
        </div>
        <div>
          <p className="text-xs font-medium text-secondary">Total de pacientes</p>
          <p className="text-4xl font-extrabold text-on-surface mt-1 tracking-tight">
            {totalPatients.toLocaleString()}
          </p>
          <p className="text-[11px] text-outline mt-3">pacientes registrados en tu cuenta</p>
        </div>
      </div>

      {/* Card 2 — Top 3 clínicas */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-secondary-container/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-secondary text-[20px]">home_health</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface">Top clínicas</h4>
        </div>

        {topClinics.length === 0 ? (
          <p className="text-xs text-secondary py-4 text-center">Sin datos aún</p>
        ) : (
          <div className="space-y-3">
            {topClinics.map((clinic, i) => (
              <div key={clinic.name}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="text-[10px] font-bold text-outline w-4 shrink-0">
                      #{i + 1}
                    </span>
                    <span className="text-xs font-semibold text-on-surface truncate">
                      {clinic.name}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-secondary shrink-0 ml-2">
                    {clinic.patient_count}
                  </span>
                </div>
                <div className="h-1.5 bg-surface-container rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary/60 rounded-full transition-all"
                    style={{ width: `${(clinic.patient_count / maxClinicCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card 3 — Top 3 pacientes frecuentes */}
      <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-9 h-9 rounded-xl bg-teal-surface flex items-center justify-center">
            <span className="material-symbols-outlined text-teal-accent text-[20px]">repeat</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface">Más frecuentes</h4>
        </div>

        {topPatients.length === 0 ? (
          <p className="text-xs text-secondary py-4 text-center">Sin datos aún</p>
        ) : (
          <div className="space-y-3">
            {topPatients.map((p) => (
              <Link
                key={p.patient_id}
                href={`/patients/${p.patient_id}`}
                className="flex items-center gap-3 group"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${avatarColor(p.full_name)}`}>
                  {getInitials(p.full_name)}
                </div>
                <p className="text-xs font-semibold text-on-surface truncate flex-1 group-hover:text-primary transition-colors">
                  {p.full_name}
                </p>
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-surface text-teal-accent border border-teal-border">
                  {p.visit_count} {p.visit_count === 1 ? "visita" : "visitas"}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}
