"use client"

import { useTransition, useState } from "react"
import { signIn } from "@/lib/actions/auth"

export default function LoginForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await signIn(
        form.get("email") as string,
        form.get("password") as string
      )
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {/* Email */}
      <div className="space-y-1.5">
        <label
          htmlFor="email"
          className="block font-label text-sm font-semibold text-on-surface-variant"
        >
          Correo electrónico
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute inset-y-0 left-3 flex items-center text-[18px] leading-none top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          >
            mail
          </span>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="doctor@clinica.com"
            aria-label="Correo electrónico"
            disabled={isPending}
            className="block w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-base text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
        </div>
      </div>

      {/* Password */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block font-label text-sm font-semibold text-on-surface-variant"
          >
            Contraseña
          </label>
          <a
            href="#"
            className="text-xs font-medium text-primary hover:underline transition-colors"
          >
            ¿Olvidaste tu contraseña?
          </a>
        </div>
        <div className="relative">
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute inset-y-0 left-3 flex items-center text-[18px] leading-none top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          >
            lock
          </span>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            placeholder="••••••••"
            aria-label="Contraseña"
            disabled={isPending}
            className="block w-full pl-10 pr-11 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-base text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
          <button
            type="button"
            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2.5 bg-error-container rounded-lg text-on-error-container text-sm"
        >
          <span className="material-symbols-outlined text-[16px] shrink-0">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* CTA */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-base min-h-[44px] py-3 rounded-lg shadow-md hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? (
          <>
            <span className="material-symbols-outlined text-[20px] animate-spin">
              progress_activity
            </span>
            Iniciando sesión…
          </>
        ) : (
          <>
            Iniciar sesión
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </>
        )}
      </button>
    </form>
  )
}
