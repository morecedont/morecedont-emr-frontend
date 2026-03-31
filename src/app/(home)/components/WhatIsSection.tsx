export default function WhatIsSection() {
  return (
    <section className="py-24 bg-brand-section-alt">
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Text */}
          <div>
            <span className="inline-block px-4 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold mb-4">
              SOBRE NOSOTROS
            </span>
            <h2 className="font-headline text-3xl md:text-5xl font-bold text-brand-dark mb-6">
              Una plataforma hecha por y para odontólogos
            </h2>
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed">
              Entendemos los retos del día a día en la consulta. Por eso
              diseñamos una interfaz intuitiva que prioriza la claridad clínica
              sobre la complejidad técnica. Gestiona diagnósticos, tratamientos
              y evoluciones con un solo clic.
            </p>
            <ul className="space-y-4">
              {[
                "Interfaz editorial de alta legibilidad",
                "Estandarización de procesos clínicos",
                "Cumplimiento con normativas de salud",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    check_circle
                  </span>
                  <span className="text-brand-dark font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* App mockup */}
          <div className="bg-surface-container-lowest rounded-xl shadow-2xl p-4 transform rotate-1 hover:rotate-0 transition-transform duration-500 border border-white">
            <div className="bg-surface-container-low rounded-lg p-6 min-h-96">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 bg-surface-container-lowest rounded-full" />
                  <div>
                    <div className="h-4 w-32 bg-on-surface/10 rounded mb-2" />
                    <div className="h-3 w-20 bg-on-surface/5 rounded" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-surface-container-lowest rounded" />
                  <div className="h-8 w-8 bg-surface-container-lowest rounded" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2 space-y-4">
                  <div className="h-32 bg-surface-container-lowest rounded-lg p-4">
                    <div className="h-4 w-1/3 bg-primary/10 rounded mb-4" />
                    <div className="space-y-2">
                      <div className="h-2 w-full bg-surface-container rounded" />
                      <div className="h-2 w-full bg-surface-container rounded" />
                      <div className="h-2 w-3/4 bg-surface-container rounded" />
                    </div>
                  </div>
                  <div className="h-48 bg-surface-container-lowest rounded-lg p-4">
                    <div className="h-4 w-1/4 bg-primary/10 rounded mb-4" />
                    <div className="grid grid-cols-8 gap-2">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded ${
                            i === 4 ? "bg-primary/40" : "bg-primary-fixed/30"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="h-40 bg-surface-container-lowest rounded-lg" />
                  <div className="h-40 bg-surface-container-lowest rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
