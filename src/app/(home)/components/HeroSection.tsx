import Link from "next/link"

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative pt-32 pb-20 overflow-hidden bg-surface-container-low"
    >
      {/* Decorative blobs */}
      <div className="absolute top-20 -right-20 w-96 h-96 bg-brand-shape-a/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -left-20 w-80 h-80 bg-brand-shape-b/20 rounded-full blur-3xl pointer-events-none" />
      {/* Dot grid */}
      <div className="hero-pattern absolute inset-0 opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
        {/* Text */}
        <div>
          <h1 className="font-headline text-5xl md:text-6xl font-extrabold text-brand-dark leading-tight tracking-tight mb-6">
            Lleva el historial clínico de tus pacientes a{" "}
            <span className="text-primary">otro nivel</span>
          </h1>
          <p className="text-xl text-on-surface-variant mb-10 max-w-lg leading-relaxed">
            La plataforma inteligente para odontólogos que buscan centralizar
            su práctica, mejorar la atención y digitalizar su consulta de forma
            segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="px-8 py-4 bg-primary text-on-primary font-bold rounded-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all text-center"
            >
              Solicitar acceso
            </Link>
            <a
              href="#como-funciona"
              className="px-8 py-4 bg-surface-container-lowest text-on-surface font-bold border border-outline-variant/20 rounded-lg hover:bg-white transition-all flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-xl">
                play_circle
              </span>
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Visual */}
        <div className="relative">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/50 bg-gradient-to-br from-primary-fixed to-surface-container-high min-h-72 flex items-center justify-center">
            <div className="p-8 w-full">
              {/* Mockup UI skeleton */}
              <div className="bg-surface-container-lowest/80 rounded-lg p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-base">
                      person
                    </span>
                  </div>
                  <div className="space-y-1 flex-1">
                    <div className="h-3 w-32 bg-on-surface/10 rounded" />
                    <div className="h-2 w-20 bg-on-surface/5 rounded" />
                  </div>
                  <div className="h-6 w-16 bg-primary/10 rounded-full" />
                </div>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-6 rounded ${
                        i === 4 ? "bg-primary/40" : "bg-primary-fixed/30"
                      }`}
                    />
                  ))}
                </div>
                <div className="space-y-2">
                  <div className="h-2 w-full bg-on-surface/5 rounded" />
                  <div className="h-2 w-3/4 bg-on-surface/5 rounded" />
                </div>
              </div>
            </div>
          </div>

          {/* Floating card */}
          <div className="absolute -bottom-6 -left-6 bg-surface-container-lowest p-5 rounded-lg shadow-xl max-w-xs hidden md:block">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-fixed rounded-full flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-base">
                  analytics
                </span>
              </div>
              <div>
                <p className="text-on-surface font-bold text-sm">
                  Historial Digital
                </p>
                <p className="text-on-surface-variant text-xs">
                  Acceso inmediato 24/7
                </p>
              </div>
            </div>
            <div className="h-2 w-full bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary w-3/4" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
