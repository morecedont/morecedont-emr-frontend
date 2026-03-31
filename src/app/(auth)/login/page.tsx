import LoginForm from "./LoginForm"

export const metadata = {
  title: "Iniciar sesión — Morecedont",
}

export default function LoginPage() {
  return (
    <div className="bg-geometric min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decorative blobs */}
      <div
        aria-hidden="true"
        className="absolute -top-[10%] -left-[5%] w-96 h-96 rounded-full bg-[#C9CDEB]/20 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-[10%] -right-[5%] w-[32rem] h-[32rem] rounded-full bg-[#3F5AA6]/5 blur-3xl pointer-events-none"
      />

      <main className="w-full max-w-[440px] relative z-10">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-14 h-14 bg-gradient-to-br from-primary to-primary-container rounded-xl flex items-center justify-center shadow-lg mb-4">
            <span
              className="material-symbols-outlined text-white text-[28px]"
              style={{ fontVariationSettings: '"FILL" 1' }}
            >
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

        {/* Card */}
        <div className="glass-card border border-outline-variant/20 rounded-xl p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="font-headline text-2xl font-bold text-on-surface tracking-tight">
              Bienvenido de vuelta
            </h2>
            <p className="text-on-surface-variant text-sm mt-1.5">
              Ingresa tus credenciales clínicas para continuar.
            </p>
          </div>

          <LoginForm />

          {/* Divider */}
          <div className="relative my-7" style={{ display: "none" }}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/20" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white/80 px-4 text-[11px] text-outline font-medium uppercase tracking-wider">
                O inicio institucional
              </span>
            </div>
          </div>

          {/* Google SSO */}
          <button
            type="button"
            style={{ display: "none" }}
            className="w-full flex items-center justify-center gap-3 bg-surface-container-lowest/50 hover:bg-surface-container border border-outline-variant/30 text-on-surface font-medium text-sm py-3 rounded-lg transition-all duration-200"
          >
            <svg
              aria-hidden="true"
              width="18"
              height="18"
              viewBox="0 0 48 48"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 19.004 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continuar con Google Workspace
          </button>
        </div>

        {/* Register link */}
        <p className="text-center mt-8 text-on-surface-variant text-sm">
          ¿No tienes cuenta clínica?{" "}
          <a
            href="/register"
            className="text-primary font-bold hover:underline transition-colors"
          >
            Solicitar acceso a Morecedont
          </a>
        </p>

        {/* Footer */}
        <div className="mt-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-6 text-xs text-outline font-medium">
            <a href="#" className="hover:text-primary transition-colors">
              Política de Privacidad
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Términos de Servicio
            </a>
            <a
              href="#"
              style={{ display: "none" }}
              className="hover:text-primary transition-colors"
            >
              Cumplimiento HIPAA
            </a>
          </div>
          <div className="flex items-center gap-2 py-2 px-4 bg-surface-container-low rounded-full">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">
              Todos los sistemas operacionales
            </span>
          </div>
        </div>
      </main>

      {/* Decorative dentistry icon — desktop only */}
      <div
        aria-hidden="true"
        className="hidden lg:block fixed right-12 bottom-12 w-64 h-64 opacity-[0.07] pointer-events-none select-none"
      >
        <span className="material-symbols-outlined text-[12rem] text-primary leading-none">
          dentistry
        </span>
      </div>
    </div>
  )
}
