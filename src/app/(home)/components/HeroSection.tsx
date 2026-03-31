import Image from "next/image"
import Link from "next/link"

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative pt-24 sm:pt-28 lg:pt-32 pb-12 sm:pb-16 lg:pb-20 overflow-hidden bg-surface-container-low"
    >
      {/* Decorative blobs — hidden on mobile to prevent overflow */}
      <div className="hidden sm:block absolute top-20 -right-20 w-72 lg:w-96 h-72 lg:h-96 bg-brand-shape-a/10 rounded-full blur-3xl pointer-events-none" />
      <div className="hidden sm:block absolute bottom-10 -left-20 w-64 lg:w-80 h-64 lg:h-80 bg-brand-shape-b/20 rounded-full blur-3xl pointer-events-none" />
      {/* Dot grid */}
      <div className="hero-pattern absolute inset-0 opacity-40 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 grid lg:grid-cols-2 gap-10 lg:gap-12 items-center">
        {/* Text */}
        <div>
          <h1 className="font-headline text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-brand-dark leading-tight tracking-tight mb-5 sm:mb-6">
            Lleva el historial clínico de tus pacientes a{" "}
            <span className="text-primary">otro nivel</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-on-surface-variant mb-8 sm:mb-10 max-w-lg leading-relaxed">
            La plataforma inteligente para odontólogos que buscan centralizar
            su práctica, mejorar la atención y digitalizar su consulta de forma
            segura.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center h-11 sm:h-auto px-8 py-3 sm:py-4 bg-primary text-on-primary font-bold rounded-lg shadow-xl shadow-primary/20 hover:scale-105 transition-all"
            >
              Solicitar acceso
            </Link>
            <a
              href="#como-funciona"
              className="inline-flex items-center justify-center h-11 sm:h-auto px-8 py-3 sm:py-4 bg-surface-container-lowest text-on-surface font-bold border border-outline-variant/20 rounded-lg hover:bg-white transition-all gap-2"
            >
              <span className="material-symbols-outlined text-xl">
                play_circle
              </span>
              Ver cómo funciona
            </a>
          </div>
        </div>

        {/* Visual — shown below text on mobile */}
        <div className="relative mt-4 lg:mt-0">
          <div className="rounded-xl overflow-hidden shadow-2xl border border-white/50">
            <Image
              src="/hero-section.jpg"
              alt="Interior de clínica dental moderna con equipamiento odontológico"
              width={1024}
              height={684}
              className="w-full h-auto object-cover"
              priority
            />
          </div>

          {/* Floating card — desktop only */}
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
