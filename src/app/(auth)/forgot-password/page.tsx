import { Suspense } from "react"
import ForgotPasswordForm from "./ForgotPasswordForm"

export const metadata = {
  title: "Recuperar contraseña — Morecedont",
}

export default function ForgotPasswordPage() {
  return (
    <div className="bg-geometric min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -top-[10%] -left-[5%] w-64 sm:w-96 h-64 sm:h-96 rounded-full bg-brand-shape-b/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="hidden sm:block absolute -bottom-[10%] -right-[5%] w-72 sm:w-[32rem] h-72 sm:h-[32rem] rounded-full bg-brand-shape-a/5 blur-3xl pointer-events-none"
      />

      <main className="w-full max-w-[440px] relative z-10">
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg mb-4">
            <span className="material-symbols-filled text-white text-[28px]">
              medical_services
            </span>
          </div>
          <h1 className="font-headline text-[1.75rem] font-extrabold tracking-tight text-on-surface leading-none">
            Morecedont
          </h1>
          <p className="font-label text-[11px] text-secondary tracking-widest uppercase mt-1.5">
            Sonrisas Inteligentes
          </p>
        </div>

        <div className="glass-card border border-outline-variant/20 rounded-xl p-6 sm:p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Recuperar contraseña
            </h2>
            <p className="text-on-surface-variant text-sm mt-1.5">
              Ingresá tu correo y te enviaremos un enlace para restablecerla.
            </p>
          </div>

          <Suspense fallback={null}>
            <ForgotPasswordForm />
          </Suspense>
        </div>

        <p className="text-center mt-8 text-on-surface-variant text-sm">
          <a
            href="/login"
            className="text-primary font-bold hover:underline transition-colors"
          >
            Volver a iniciar sesión
          </a>
        </p>
      </main>
    </div>
  )
}
