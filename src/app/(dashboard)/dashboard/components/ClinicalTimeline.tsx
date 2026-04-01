"use client"

import Link from "next/link"

// TODO: connect to real appointments/events data
const TIMELINE_ITEMS = [
  {
    time: "09:00 AM",
    title: "Reunión de equipo",
    description: "Revisión de casos complejos de la semana",
    type: "primary" as const,
  },
  {
    time: "10:30 AM",
    title: "Sarah Jenkins",
    description: "Chequeo y limpieza (Consultorio 302)",
    type: "secondary" as const,
  },
  {
    time: "01:15 PM",
    title: "Caso de emergencia",
    description: "Paciente Mike Ross — Dolor agudo",
    type: "error" as const,
  },
  {
    time: "04:00 PM",
    title: "Revisión de registros",
    description: "Actualización de historias clínicas",
    type: "muted" as const,
  },
]

const DOT_CLASSES: Record<string, string> = {
  primary: "border-primary",
  secondary: "border-secondary-container",
  error: "border-error/30",
  muted: "border-primary-fixed",
}

const TIME_CLASSES: Record<string, string> = {
  primary: "text-primary",
  secondary: "text-secondary",
  error: "text-error",
  muted: "text-outline",
}

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

      {/* Timeline */}
      <div className="bg-surface-container-low rounded-xl p-5 sm:p-6 relative">
        {/* Vertical line */}
        <div className="absolute left-[2.25rem] sm:left-[2.5rem] top-8 bottom-8 w-[2px] bg-primary-fixed" />

        <div className="space-y-6 sm:space-y-8 relative">
          {TIMELINE_ITEMS.map((item) => (
            <div key={item.time} className="flex gap-3 sm:gap-4 relative">
              {/* Dot */}
              <div
                className={`w-4 h-4 rounded-full bg-surface-container-lowest border-4 z-10 mt-1 shadow-sm shrink-0 ${DOT_CLASSES[item.type]}`}
              />
              <div>
                <p
                  className={`text-[11px] font-bold uppercase ${TIME_CLASSES[item.type]}`}
                >
                  {item.time}
                </p>
                <p className="text-sm font-bold text-on-surface">{item.title}</p>
                <p className="text-xs text-secondary mt-0.5">{item.description}</p>
              </div>
            </div>
          ))}
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
