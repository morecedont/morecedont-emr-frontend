"use client"

import Link from "next/link"

export default function ClinicalTimeline() {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-bold text-brand-dark">
          Agenda del día
        </h3>
        <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-surface-container transition-colors">
          <span className="material-symbols-outlined text-outline text-[20px]">
            more_horiz
          </span>
        </button>
      </div>

      <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 relative">
        <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-outline-variant/30 bg-surface-container-lowest/60 px-6 py-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <span className="material-symbols-outlined text-[28px]">calendar_month</span>
          </div>
          <h4 className="text-sm font-bold text-on-surface sm:text-base">
            Agenda clínica próximamente sincronizada
          </h4>
          <p className="mt-2 max-w-sm text-sm text-secondary">
            Próximamente integraremos esta sección con Google Calendar para gestionar las citas de los pacientes desde un solo lugar.
          </p>
          <p className="mt-3 text-xs text-outline">
            Cuando la integración esté disponible, aquí verás tu agenda diaria en tiempo real.
          </p>
        </div>
      </div>

      {/* Quick action — New Patient */}
      <Link
        href="/patients/new"
        className="flex items-center justify-between p-5 sm:p-6 bg-surface-container-lowest border border-outline-variant/20 rounded-xl hover:border-primary/40 transition-all group"
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-secondary-container/20 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">add_circle</span>
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Nuevo paciente</p>
            <p className="text-xs text-secondary">Formulario de ingreso rápido</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </Link>

      {/* Floating FAB — mobile only */}
      <Link
        href="/patients/new"
        className="lg:hidden fixed bottom-6 right-6 w-14 h-14 bg-sidebar-active text-white rounded-full shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-50"
        aria-label="Nuevo paciente"
      >
        <span className="material-symbols-outlined">add</span>
      </Link>
    </div>
  )
}
