import Link from "next/link"

export const metadata = {
  title: "Solicitud en revisión — Morecedont",
}

export default function PendingPage() {
  return (
    <div className="bg-background min-h-screen flex flex-col items-center">
      <main className="flex-grow flex items-center justify-center p-6 w-full">
        <div className="w-full max-w-xl space-y-8 flex flex-col items-center">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[2.25rem]">
              clinical_notes
            </span>
            <h1 className="font-headline font-bold text-3xl tracking-tight text-on-surface">
              Morecedont
            </h1>
          </div>

          {/* Card */}
          <div className="bg-surface-container-lowest w-full rounded-xl border border-outline-variant/20 shadow-sm p-8 md:p-12 text-center space-y-8">
            {/* Illustration */}
            <div className="relative inline-flex items-center justify-center w-32 h-32 bg-surface-container-low rounded-full mx-auto">
              <span
                className="material-symbols-outlined text-primary text-[3.75rem] leading-none"
                style={{ fontVariationSettings: '"FILL" 0, "wght" 300' }}
              >
                hourglass_empty
              </span>
              <div className="absolute -right-2 -top-2 bg-primary-fixed text-on-primary-fixed p-2 rounded-full shadow-sm">
                <span className="material-symbols-outlined text-[18px] leading-none">
                  update
                </span>
              </div>
            </div>

            {/* Text */}
            <div className="space-y-3">
              <h2 className="font-headline font-bold text-2xl text-on-surface">
                Solicitud recibida
              </h2>
              <p className="text-secondary text-sm leading-relaxed max-w-sm mx-auto">
                Hemos recibido tu solicitud de registro. Nuestro equipo verificará
                tus credenciales profesionales y recibirás un correo en los
                próximos días hábiles.
              </p>
            </div>

            {/* Timeline */}
            <div className="relative w-full py-4">
              {/* Connector line */}
              <div className="absolute top-8 left-[15%] right-[15%] h-[2px] bg-outline-variant/30" />

              <div className="relative flex justify-between items-start">
                {/* Step 1 — Completado */}
                <div className="flex flex-col items-center gap-3 w-1/3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white z-10">
                    <span className="material-symbols-outlined text-[18px] leading-none">
                      check
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-primary uppercase tracking-wider text-center">
                    Solicitud enviada
                  </span>
                </div>

                {/* Step 2 — Activo con pulse */}
                <div className="flex flex-col items-center gap-3 w-1/3">
                  <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center z-10">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse-ring" />
                  </div>
                  <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider text-center">
                    En revisión
                  </span>
                </div>

                {/* Step 3 — Pendiente */}
                <div className="flex flex-col items-center gap-3 w-1/3">
                  <div className="w-8 h-8 rounded-full bg-surface-dim flex items-center justify-center text-on-surface-variant z-10">
                    <span className="material-symbols-outlined text-[18px] leading-none">
                      lock_clock
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-on-surface-variant/60 uppercase tracking-wider text-center">
                    Cuenta activada
                  </span>
                </div>
              </div>
            </div>

            {/* Action */}
            <div className="pt-2">
              <Link
                href="/"
                className="inline-block px-8 py-3 border-2 border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary-fixed/20 active:scale-95 transition-all duration-200"
              >
                Volver al inicio
              </Link>
            </div>
          </div>

          {/* Support */}
          <p className="text-secondary text-sm font-medium opacity-80">
            ¿Tienes dudas? Escríbenos a{" "}
            <a
              href="mailto:soporte@morecedont.com"
              className="text-primary hover:underline transition-colors"
            >
              soporte@morecedont.com
            </a>
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 flex flex-col md:flex-row justify-center items-center gap-4 md:gap-8">
        <p className="text-sm text-secondary">
          © 2024 Morecedont Clinical Systems. Todos los derechos reservados.
        </p>
        <div className="flex gap-6 text-sm text-secondary">
          <a href="#" className="hover:text-primary transition-colors">
            Política de Privacidad
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Términos de Servicio
          </a>
          <a href="#" className="hover:text-primary transition-colors">
            Soporte
          </a>
        </div>
      </footer>
    </div>
  )
}
