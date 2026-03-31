import Link from "next/link"

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-footer to-brand-shape-a" />

      {/* Decorative shapes */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-shape-b/10 rounded-full -mr-20 -mt-20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-shape-a/10 rounded-full -ml-32 -mb-32 pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 md:px-8 relative z-10 text-center text-white">
        <h2 className="font-headline text-4xl md:text-5xl font-extrabold mb-8">
          Empieza a transformar tu consulta hoy mismo
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-2xl mx-auto">
          Únete a la nueva era de la odontología digital con Morecedont.
          Organización, seguridad y profesionalismo.
        </p>
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link
            href="/register"
            className="px-10 py-5 bg-primary-container text-on-primary-container font-extrabold rounded-lg shadow-2xl hover:scale-105 transition-all text-lg"
          >
            Solicitar acceso gratuito
          </Link>
          <a
            href="mailto:soporte@morecedont.com"
            className="px-10 py-5 border-2 border-white/40 text-white font-extrabold rounded-lg hover:bg-white/10 transition-all text-lg"
          >
            Tengo dudas
          </a>
        </div>
      </div>
    </section>
  )
}
