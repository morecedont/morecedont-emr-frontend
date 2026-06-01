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
    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
    </section>
  )
}
