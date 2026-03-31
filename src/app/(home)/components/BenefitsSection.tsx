const benefits = [
  {
    icon: "clinical_notes",
    title: "Historia clínica completa",
    description:
      "Registra antecedentes, odontogramas y evoluciones en un formato digital estructurado y fácil de leer.",
  },
  {
    icon: "security",
    title: "Tus datos, seguros",
    description:
      "Encriptación de nivel bancario y copias de seguridad automáticas para proteger la privacidad de tus pacientes.",
  },
  {
    icon: "distance",
    title: "Trabaja en varias clínicas",
    description:
      "Accede a tu cuenta desde cualquier consultorio, manteniendo la continuidad de la información sin importar dónde estés.",
  },
  {
    icon: "group_add",
    title: "Comparte historiales con colegas",
    description:
      "Colabora con especialistas enviando derivaciones e historiales completos de forma segura dentro de la plataforma.",
  },
  {
    icon: "payments",
    title: "Control de presupuestos y pagos",
    description:
      "Genera presupuestos claros y realiza un seguimiento detallado de los pagos pendientes y realizados.",
  },
  {
    icon: "photo_library",
    title: "Adjunta radiografías y estudios",
    description:
      "Almacena imágenes diagnósticas directamente en el perfil del paciente para una consulta rápida y comparativa.",
  },
]

export default function BenefitsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-surface-container-lowest">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-4">
            Todo lo que necesitas para gestionar tu consulta
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant max-w-2xl mx-auto">
            Funcionalidades diseñadas para optimizar cada aspecto de tu labor
            odontológica.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="p-6 sm:p-8 rounded-lg border border-outline-variant/10 hover:border-primary/30 transition-all hover:bg-surface-container-low group"
            >
              <span className="material-symbols-outlined text-primary text-3xl sm:text-4xl mb-5 sm:mb-6 block group-hover:scale-110 transition-transform">
                {b.icon}
              </span>
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-2 sm:mb-3">
                {b.title}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
