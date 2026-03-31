import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-footer to-brand-shape-a" />

      {/* Decorative shapes — hidden on mobile */}
      <div className="hidden sm:block absolute top-0 right-0 w-48 h-48 lg:w-64 lg:h-64 bg-brand-shape-b/10 rounded-full -mr-16 lg:-mr-20 -mt-16 lg:-mt-20 pointer-events-none" />
      <div className="hidden sm:block absolute bottom-0 left-0 w-64 h-64 lg:w-96 lg:h-96 bg-brand-shape-a/10 rounded-full -ml-24 lg:-ml-32 -mb-24 lg:-mb-32 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center text-white">
        <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-5 sm:mb-6 lg:mb-8">
          Empieza a transformar tu consulta hoy mismo
        </h2>
        <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-10 lg:mb-12 max-w-2xl mx-auto">
          Únete a la nueva era de la odontología digital con Morecedont.
          Organización, seguridad y profesionalismo.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-stretch sm:items-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center h-11 sm:h-auto px-8 sm:px-10 py-2.5 sm:py-5 bg-primary-container text-on-primary-container font-extrabold rounded-lg shadow-2xl hover:scale-105 transition-all text-base sm:text-lg"
          >
            Solicitar acceso gratuito
          </Link>
          <a
            href="mailto:soporte@morecedont.com"
            className="inline-flex items-center justify-center h-11 sm:h-auto px-8 sm:px-10 py-2.5 sm:py-5 border-2 border-white/40 text-white font-extrabold rounded-lg hover:bg-white/10 transition-all text-base sm:text-lg"
          >
            Tengo dudas
          </a>
        </div>
      </div>
    </section>
  )
}
