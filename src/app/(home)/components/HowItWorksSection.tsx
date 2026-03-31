import Link from "next/link"

const steps = [
  {
    number: "1",
    title: "Solicita tu acceso",
    description:
      "Completa el formulario y un asesor se pondrá en contacto contigo para configurar tu perfil.",
  },
  {
    number: "2",
    title: "Activa tu cuenta",
    description:
      "Recibe tus credenciales y accede a tu panel personalizado con todas las herramientas listas.",
  },
  {
    number: "3",
    title: "Empieza a gestionar",
    description:
      "Importa tus pacientes actuales o comienza a registrar nuevos tratamientos desde el primer minuto.",
  },
]

export default function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-12 sm:py-16 lg:py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12 lg:mb-16">
          <h2 className="font-headline text-2xl sm:text-3xl lg:text-4xl font-bold text-brand-dark mb-4">
            Empieza en 3 pasos
          </h2>
          <p className="text-sm sm:text-base text-on-surface-variant">
            La digitalización de tu consultorio nunca fue tan sencilla.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 relative">
          {/* Connector line — desktop only */}
          <div className="hidden sm:block absolute top-11 left-0 w-full h-0.5 bg-outline-variant/30 -z-0" />

          {steps.map((step) => (
            <div key={step.number} className="relative z-10 text-center flex flex-col items-center">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-surface-container-lowest border-4 border-primary rounded-full flex items-center justify-center text-2xl sm:text-3xl font-extrabold text-primary mb-6 sm:mb-8 shadow-lg">
                {step.number}
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-brand-dark mb-3 sm:mb-4">
                {step.title}
              </h3>
              <p className="text-sm sm:text-base text-on-surface-variant max-w-xs mx-auto">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 sm:mt-14 lg:mt-16 text-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-11 sm:h-auto px-8 sm:px-10 py-2.5 sm:py-4 bg-primary text-on-primary font-bold rounded-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Solicitar acceso ahora
          </Link>
        </div>
      </div>
    </section>
  )
}
