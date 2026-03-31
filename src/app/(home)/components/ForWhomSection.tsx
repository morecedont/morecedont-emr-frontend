const profiles = [
  {
    icon: "person",
    title: "Odontólogo independiente",
    description:
      "Simplifica tu administración y proyecta una imagen más profesional y moderna ante tus pacientes.",
  },
  {
    icon: "apartment",
    title: "Odontólogo multisede",
    description:
      "Centraliza la información de todas tus ubicaciones en un solo lugar, accesible desde cualquier dispositivo.",
  },
  {
    icon: "medical_services",
    title: "Especialista",
    description:
      "Herramientas específicas para cada especialidad que facilitan el registro de procedimientos complejos.",
  },
]

export default function ForWhomSection() {
  return (
    <section id="para-quien" className="py-12 sm:py-16 lg:py-24 bg-brand-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-8 sm:mb-10 lg:mb-12 text-center">
          Ideal si eres...
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {profiles.map((p) => (
            <div
              key={p.title}
              className="bg-surface-container-lowest p-6 sm:p-8 rounded-lg shadow-sm border-l-4 border-primary"
            >
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-5 sm:mb-6">
                <span className="material-symbols-outlined text-primary">
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
