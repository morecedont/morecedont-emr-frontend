"use client"

import { useState, useTransition } from "react"
import { useSearchParams } from "next/navigation"
import { requestPasswordReset } from "@/lib/actions/auth"

export default function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [sent, setSent] = useState(false)
  const searchParams = useSearchParams()
  const linkError = searchParams.get("error")

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    startTransition(async () => {
      await requestPasswordReset(form.get("email") as string)
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div
        role="status"
        className="flex flex-col items-center text-center gap-3 py-4"
      >
        <span className="material-symbols-filled text-primary text-[40px]">
          mark_email_read
        </span>
        <p className="font-headline font-bold text-on-surface">
          Revisá tu correo
        </p>
        <p className="text-sm text-on-surface-variant">
          Si ese email está registrado, te enviamos un enlace para restablecer
          tu contraseña. Puede tardar unos minutos.
        </p>
        <a
          href="/login"
          className="mt-2 text-sm text-primary font-bold hover:underline"
        >
          Volver a iniciar sesión
        </a>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {linkError && (
        <div
          role="alert"
          className="flex items-center gap-2 px-3 py-2.5 bg-error-container rounded-lg text-on-error-container text-sm"
        >
          <span className="material-symbols-outlined text-[16px] shrink-0">
            error
          </span>
          <span>
            {linkError === "expired"
              ? "El enlace expiró o ya se usó. Pedí uno nuevo."
              : "El enlace no es válido. Pedí uno nuevo."}
          </span>
        </div>
      )}

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
            Enviando…
          </>
        ) : (
          <>
            Enviar enlace
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </>
        )}
      </button>
    </form>
  )
}
