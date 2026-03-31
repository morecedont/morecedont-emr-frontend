export default function WhatIsSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-brand-section-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-12 lg:gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4">
              SOBRE NOSOTROS
            </span>
            <h2 className="font-headline text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-brand-dark mb-5 sm:mb-6">
              Una plataforma hecha por y para odontólogos
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-on-surface-variant mb-6 sm:mb-8 leading-relaxed">
              Entendemos los retos del día a día en la consulta. Por eso
              diseñamos una interfaz intuitiva que prioriza la claridad clínica
              sobre la complejidad técnica. Gestiona diagnósticos, tratamientos
              y evoluciones con un solo clic.
            </p>
            <ul className="space-y-3 sm:space-y-4">
              {[
                "Interfaz editorial de alta legibilidad",
                "Estandarización de procesos clínicos",
                "Cumplimiento con normativas de salud",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary shrink-0">
                    check_circle
                  </span>
                  <span className="text-sm sm:text-base text-brand-dark font-medium">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* App mockup — hidden on small mobile, shown sm+ */}
          <div className="hidden sm:block bg-surface-container-lowest rounded-xl shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-white">
            <div className="bg-surface-container-low rounded-lg p-5 sm:p-6">
              <div className="flex justify-between items-center mb-6 sm:mb-8">
                <div className="flex gap-3 sm:gap-4 items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-surface-container-lowest rounded-full shrink-0" />
                  <div>
                    <div className="h-3 sm:h-4 w-24 sm:w-32 bg-on-surface/10 rounded mb-2" />
                    <div className="h-2 sm:h-3 w-16 sm:w-20 bg-on-surface/5 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-surface-container-lowest rounded" />
                  <div className="h-7 w-7 sm:h-8 sm:w-8 bg-surface-container-lowest rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 sm:gap-4">
                <div className="col-span-2 space-y-3 sm:space-y-4">
                  <div className="h-28 sm:h-32 bg-surface-container-lowest rounded-lg p-3 sm:p-4">
                    <div className="h-3 sm:h-4 w-1/3 bg-primary/10 rounded mb-3 sm:mb-4" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-surface-container rounded" />
                      <div className="h-2 w-full bg-surface-container rounded" />
                      <div className="h-2 w-3/4 bg-surface-container rounded" />
                    </div>
                  </div>
                  <div className="h-40 sm:h-48 bg-surface-container-lowest rounded-lg p-3 sm:p-4">
                    <div className="h-3 sm:h-4 w-1/4 bg-primary/10 rounded mb-3 sm:mb-4" />
                    <div className="grid grid-cols-8 gap-1 sm:gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-6 sm:h-8 rounded ${
                            i === 4 ? "bg-primary/40" : "bg-primary-fixed/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <div className="h-36 sm:h-40 bg-surface-container-lowest rounded-lg" />
                  <div className="h-36 sm:h-40 bg-surface-container-lowest rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
