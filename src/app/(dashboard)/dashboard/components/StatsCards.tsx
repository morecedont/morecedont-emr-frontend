interface StatsCardsProps {
  totalPatients: number
  recentConsultations: number
}

export default function StatsCards({
  totalPatients,
  recentConsultations,
}: StatsCardsProps) {
  const avgPerDay =
    recentConsultations > 0 ? (recentConsultations / 30).toFixed(1) : "0"

  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {/* Card 1 — Total Patients */}
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-lg hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-primary/10 rounded-xl">
            <span className="material-symbols-outlined text-primary">groups</span>
          </div>
          <span className="text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
            +12.5%
          </span>
        </div>
        <p className="text-secondary text-sm font-medium">Total de pacientes</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
          {totalPatients.toLocaleString()}
        </h3>
        <p className="text-[11px] text-outline mt-4 flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">history</span>
          Actualizado hace 2 min
        </p>
      </div>

      {/* Card 2 — Recent Consultations */}
      <div className="bg-surface-container-low p-5 sm:p-6 rounded-lg hover:-translate-y-1 transition-transform">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-secondary-container/30 rounded-xl">
            <span className="material-symbols-outlined text-secondary">
              stethoscope
            </span>
          </div>
          <span className="text-xs font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full">
            Busy
          </span>
        </div>
        <p className="text-secondary text-sm font-medium">Consultas recientes</p>
        <h3 className="text-2xl sm:text-3xl font-extrabold text-brand-dark mt-1">
          {recentConsultations}
        </h3>
        <p className="text-[11px] text-outline mt-4">
          Promedio de {avgPerDay} por día
        </p>
      </div>

      {/* Card 3 — Upcoming Today (MVP, appointments feature pending) */}
      {/* TODO: appointments feature */}
      <div className="bg-primary-container p-5 sm:p-6 rounded-lg shadow-xl shadow-primary/20 text-white relative overflow-hidden hover:-translate-y-1 transition-transform sm:col-span-2 lg:col-span-1">
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <span className="material-symbols-outlined text-white">
                event_available
              </span>
            </div>
          </div>
          <p className="text-white/80 text-sm font-medium">Citas de hoy</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-1">0</h3>
          <p className="text-[11px] text-white/60 mt-4">
            Próximamente, con la integración con Google Calendar, podrás ver aquí las citas del día.
          </p>
        </div>
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      </div>
    </section>
  )
}
