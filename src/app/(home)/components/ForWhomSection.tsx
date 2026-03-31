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
    <section id="para-quien" className="py-24 bg-brand-section-alt">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">
          Ideal si eres...
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {profiles.map((p) => (
            <div
              key={p.title}
              className="bg-surface-container-lowest p-8 rounded-lg shadow-sm border-l-4 border-primary"
            >
              <div className="w-12 h-12 bg-primary-fixed rounded-lg flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary">
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
