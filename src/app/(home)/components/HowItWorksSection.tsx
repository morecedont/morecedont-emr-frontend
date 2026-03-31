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
    <section id="como-funciona" className="py-24 bg-surface-container-low">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="text-center mb-16">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-dark mb-4">
            Empieza en 3 pasos
          </h2>
          <p className="text-on-surface-variant">
            La digitalización de tu consultorio nunca fue tan sencilla.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-12 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-outline-variant/30 -z-0" />

          {steps.map((step) => (
            <div key={step.number} className="relative z-10 text-center">
              <div className="w-24 h-24 bg-surface-container-lowest border-4 border-primary rounded-full flex items-center justify-center text-3xl font-extrabold text-primary mx-auto mb-8 shadow-lg">
                {step.number}
              </div>
              <h3 className="text-xl font-bold text-brand-dark mb-4">
                {step.title}
              </h3>
              <p className="text-on-surface-variant">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href="/register"
            className="inline-block px-10 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
          >
            Solicitar acceso ahora
          </Link>
        </div>
      </div>
    </section>
  )
}
