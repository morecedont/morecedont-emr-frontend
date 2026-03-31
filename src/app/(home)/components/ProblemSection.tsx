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
    <section className="py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            ¿Todavía gestionas tus historias clínicas en papel?
          </h2>
          <p className="text-on-surface-variant max-w-2xl mx-auto">
            La desorganización administrativa frena el crecimiento de tu
            clínica y afecta la experiencia de tus pacientes.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {problems.map((p) => (
            <div
              key={p.title}
              className="p-8 bg-surface-container-lowest rounded-lg shadow-md border border-outline-variant/10 flex flex-col items-center text-center"
            >
              <div
                className={`w-16 h-16 ${p.iconBg} ${p.iconColor} rounded-full flex items-center justify-center mb-6`}
              >
                <span className="material-symbols-outlined text-3xl">
                  {p.icon}
                </span>
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">
                {p.title}
              </h3>
              <p className="text-on-surface-variant">{p.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
