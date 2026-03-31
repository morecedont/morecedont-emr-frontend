"use client"

import { useState } from "react"

const faqs = [
  {
    question: "¿Es segura la información de mis pacientes?",
    answer:
      "Absolutamente. Utilizamos protocolos de seguridad de grado bancario (SSL/TLS) y toda la información se almacena de forma encriptada en la nube con respaldos automáticos cada hora.",
  },
  {
    question: "¿Puedo acceder desde mi tablet o móvil?",
    answer:
      "Sí, Morecedont es una plataforma web responsive. Puedes usarla en ordenadores, tablets y teléfonos móviles sin necesidad de instalar ninguna aplicación.",
  },
  {
    question: "¿Qué pasa si trabajo en varias clínicas?",
    answer:
      "La plataforma está diseñada para la movilidad. Puedes registrar múltiples consultorios y saltar de uno a otro manteniendo historiales separados pero bajo tu mismo acceso profesional.",
  },
  {
    question: "¿Cómo realizo los presupuestos?",
    answer:
      "Contamos con un módulo financiero donde puedes cargar tus aranceles y generar presupuestos PDF profesionales para entregar a tus pacientes en segundos.",
  },
  {
    question: "¿Puedo compartir historiales con otros doctores?",
    answer:
      "Sí, dentro de la plataforma puedes colaborar con otros usuarios de Morecedont para interconsultas, siempre respetando la privacidad y consentimiento del paciente.",
  },
  {
    question: "¿Existe un límite de pacientes?",
    answer:
      "Nuestros planes se adaptan al volumen de tu consulta. Tenemos opciones desde consultorios pequeños hasta clínicas de alta rotación sin límites estrictos.",
  },
]

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-surface-container-lowest">
      <div className="max-w-3xl mx-auto px-6 md:px-8">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-brand-dark mb-12 text-center">
          Preguntas Frecuentes
        </h2>

        <div className="space-y-0">
          {faqs.map((faq, index) => (
            <div
              key={faq.question}
              className="border-b border-outline-variant/30"
            >
              <button
                onClick={() => toggle(index)}
                className="flex justify-between items-center w-full text-left py-6 group"
              >
                <span className="text-brand-dark font-bold text-lg group-hover:text-primary transition-colors pr-4">
                  {faq.question}
                </span>
                <span
                  className={`material-symbols-outlined text-primary shrink-0 transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  expand_more
                </span>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? "max-h-48 pb-6" : "max-h-0"
                }`}
              >
                <p className="text-on-surface-variant leading-relaxed">
                  {faq.answer}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
