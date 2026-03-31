const problems = [
  {
    icon: "inventory_2",
    iconBg: "bg-red-50",
    iconColor: "text-red-500",
    title: "Historias clínicas dispersas",
    description:
      "Archivos físicos que se pierden, se dañan o son difíciles de consultar rápidamente durante la cita.",
  },
  {
    icon: "schedule",
    iconBg: "bg-amber-50",
    iconColor: "text-amber-500",
    title: "Tiempo perdido en administración",
    description:
      "Horas semanales dedicadas a buscar papeles en lugar de centrarte en el tratamiento de tus pacientes.",
  },
  {
    icon: "corporate_fare",
    iconBg: "bg-primary-fixed",
    iconColor: "text-primary",
    title: "Sin visibilidad entre clínicas",
    description:
      "Dificultad para acceder a los datos de un paciente si trabajas en múltiples sedes o consultorios.",
  },
]

export default function ProblemSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-4">
            ¿Todavía gestionas tus historias clínicas en papel?
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            La desorganización administrativa frena el crecimiento de tu
            clínica y afecta la experiencia de tus pacientes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="p-6 sm:p-8 bg-surface-container-lowest rounded-lg shadow-md border border-outline-variant/10 flex flex-col items-center text-center"
            >
              <div
                className={`w-14 h-14 sm:w-16 sm:h-16 ${p.iconBg} ${p.iconColor} rounded-full flex items-center justify-center mb-5 sm:mb-6`}
              >
                <span className="material-symbols-outlined text-2xl sm:text-3xl">
                  {p.icon}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-3 sm:mb-4">
                {p.title}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant">
                {p.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
