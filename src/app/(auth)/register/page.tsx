import RegisterForm from "./RegisterForm"

export const metadata = {
  title: "Solicitar acceso — Morecedont",
}

export default function RegisterPage() {
  return (
    <div className="bg-geometric min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Blob top-left — organic shape */}
      <div
        aria-hidden="true"
        className="absolute -top-24 -left-24 w-[600px] h-[600px] bg-[#3F5AA6]/5 pointer-events-none"
        style={{ borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%" }}
      />
      {/* Blob bottom-right — circle */}
      <div
        aria-hidden="true"
        className="absolute -bottom-12 -right-12 w-[400px] h-[400px] rounded-full bg-[#3F5AA6]/[0.03] pointer-events-none"
      />

      <div className="w-full max-w-2xl relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-container rounded-lg flex items-center justify-center shadow-md">
              <span
                className="material-symbols-outlined text-white text-[22px]"
                style={{ fontVariationSettings: '"FILL" 1' }}
              >
                medical_services
              </span>
            </div>
            <span className="font-headline text-2xl font-extrabold tracking-tight text-on-surface">
              Morecedont
            </span>
          </div>
          <h1 className="font-headline text-[1.75rem] font-bold text-on-surface tracking-tight">
            Solicitar acceso
          </h1>
          <p className="text-on-surface-variant text-sm text-center mt-2 max-w-sm leading-relaxed">
            Completa tu información para que podamos verificar tu perfil profesional.
          </p>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 p-8 md:p-10 shadow-lg">
          <RegisterForm />
        </div>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-3">
          <p className="text-xs text-secondary">
            © 2024 Morecedont Clinical Systems. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-5 text-xs text-outline font-medium">
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
        </div>
      </div>

      {/* Decorative dentistry icon — desktop only */}
      <div
        aria-hidden="true"
        className="hidden xl:block fixed bottom-10 right-10 w-48 opacity-[0.07] pointer-events-none select-none"
      >
        <span className="material-symbols-outlined text-[10rem] text-primary leading-none">
          dentistry
        </span>
      </div>
    </div>
  )
}
