"use client"

import { useState, useTransition } from "react"
import { updatePassword } from "@/lib/actions/auth"

export default function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const form = new FormData(e.currentTarget)
    const password = form.get("password") as string
    const confirm = form.get("confirm") as string

    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres")
      return
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden")
      return
    }

    startTransition(async () => {
      const result = await updatePassword(password)
      if (result?.error) {
        setError(result.error)
      }
      // En éxito la action hace redirect("/dashboard").
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      <div className="space-y-1.5">
        <label
          htmlFor="password"
          className="block font-label text-sm font-semibold text-on-surface-variant"
        >
          Nueva contraseña
        </label>
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
            minLength={8}
            autoComplete="new-password"
            placeholder="Mínimo 8 caracteres"
            aria-label="Nueva contraseña"
            disabled={isPending}
            className="block w-full pl-10 pr-11 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-base text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
          <button
            type="button"
            aria-label={
              showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
            }
            onClick={() => setShowPassword((v) => !v)}
            className="absolute inset-y-0 right-3 flex items-center text-outline hover:text-on-surface-variant transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      <div className="space-y-1.5">
        <label
          htmlFor="confirm"
          className="block font-label text-sm font-semibold text-on-surface-variant"
        >
          Repetir contraseña
        </label>
        <div className="relative">
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute inset-y-0 left-3 flex items-center text-[18px] leading-none top-1/2 -translate-y-1/2 text-outline pointer-events-none"
          >
            lock
          </span>
          <input
            id="confirm"
            name="confirm"
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            autoComplete="new-password"
            placeholder="Repetí la contraseña"
            aria-label="Repetir contraseña"
            disabled={isPending}
            className="block w-full pl-10 pr-4 py-3 bg-surface-container-lowest border border-outline-variant/30 rounded-lg text-base text-on-surface placeholder:text-outline/60 outline-none transition-all duration-200 focus:border-primary focus:ring-4 focus:ring-primary/10 disabled:opacity-60"
          />
        </div>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2.5 bg-error-container rounded-lg text-on-error-container text-sm"
        >
          <span className="material-symbols-outlined text-[16px] shrink-0">
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-base min-h-[44px] h-11 py-3 rounded-lg shadow-md hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
      >
        {isPending ? (
          <>
            <span className="material-symbols-outlined text-[20px] animate-spin">
              progress_activity
            </span>
            Guardando…
          </>
        ) : (
          <>
            Guardar contraseña
            <span className="material-symbols-outlined text-[20px]">
              check
            </span>
          </>
        )}
      </button>
    </form>
  )
}
