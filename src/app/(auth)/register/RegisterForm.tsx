"use client"

import { useTransition, useState } from "react"
import { signUp, type SignUpData } from "@/lib/actions/auth"

type FormErrors = Partial<Record<keyof SignUpData | "confirmPassword" | "_server", string>>

const SPECIALTIES = [
  "Odontología General",
  "Endodoncia",
  "Ortodoncia",
  "Periodoncia",
  "Cirugía Maxilofacial",
  "Odontopediatría",
]

const inputClass =
  "w-full bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-3 text-sm text-on-surface placeholder:text-outline/50 outline-none transition-all duration-200 focus:border-primary focus:ring-2 focus:ring-primary/10 disabled:opacity-60"

const labelClass = "block text-sm font-semibold text-on-surface mb-1.5"

const errorClass = "text-xs text-error mt-1.5 flex items-center gap-1"

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null
  return (
    <p className={errorClass} role="alert">
      <span className="material-symbols-outlined text-[13px]">error</span>
      {msg}
    </p>
  )
}

export default function RegisterForm() {
  const [isPending, startTransition] = useTransition()
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(fields: SignUpData & { confirmPassword: string }): FormErrors {
    const e: FormErrors = {}

    if (!fields.fullName.trim()) e.fullName = "El nombre completo es requerido."
    if (!fields.email.trim()) {
      e.email = "El correo es requerido."
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
      e.email = "Ingresa un correo válido."
    }
    if (!fields.phone.trim()) e.phone = "El teléfono es requerido."
    if (!fields.password) {
      e.password = "La contraseña es requerida."
    } else if (fields.password.length < 8) {
      e.password = "Mínimo 8 caracteres."
    }
    if (!fields.confirmPassword) {
      e.confirmPassword = "Confirma tu contraseña."
    } else if (fields.password !== fields.confirmPassword) {
      e.confirmPassword = "Las contraseñas no coinciden."
    }
    if (!fields.licenseNumber.trim()) {
      e.licenseNumber = "El número de licencia es requerido."
    } else if (fields.licenseNumber.trim().length < 4) {
      e.licenseNumber = "Mínimo 4 caracteres."
    }
    if (!fields.specialty) e.specialty = "Selecciona una especialidad."

    return e
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)

    const fields = {
      fullName:        form.get("fullName") as string,
      email:           form.get("email") as string,
      phone:           form.get("phone") as string,
      password:        form.get("password") as string,
      confirmPassword: form.get("confirmPassword") as string,
      licenseNumber:   form.get("licenseNumber") as string,
      specialty:       form.get("specialty") as string,
    }

    const errs = validate(fields)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setErrors({})
    const { confirmPassword: _, ...submitData } = fields

    startTransition(async () => {
      const result = await signUp(submitData)
      if (result?.error) {
        setErrors({ _server: result.error })
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Server error */}
      {errors._server && (
        <div
          role="alert"
          className="flex items-center gap-2 px-4 py-3 bg-error-container rounded-lg text-on-error-container text-sm"
        >
          <span className="material-symbols-outlined text-[18px] shrink-0">error</span>
          {errors._server}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Nombre completo — full width */}
        <div className="md:col-span-2">
          <label htmlFor="fullName" className={labelClass}>
            Nombre completo
          </label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            autoComplete="name"
            placeholder="Dr. Juan Pérez"
            aria-label="Nombre completo"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.fullName} />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className={labelClass}>
            Correo electrónico
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="email@ejemplo.com"
            aria-label="Correo electrónico"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.email} />
        </div>

        {/* Teléfono */}
        <div>
          <label htmlFor="phone" className={labelClass}>
            Teléfono
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+58 000 000 0000"
            aria-label="Teléfono"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.phone} />
        </div>

        {/* Contraseña */}
        <div>
          <label htmlFor="password" className={labelClass}>
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-label="Contraseña"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.password} />
        </div>

        {/* Confirmar contraseña */}
        <div>
          <label htmlFor="confirmPassword" className={labelClass}>
            Confirmar contraseña
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            aria-label="Confirmar contraseña"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.confirmPassword} />
        </div>

        {/* Número de licencia */}
        <div>
          <label htmlFor="licenseNumber" className={labelClass}>
            Número de colegiatura / licencia
          </label>
          <input
            id="licenseNumber"
            name="licenseNumber"
            type="text"
            placeholder="ID-12345678"
            aria-label="Número de colegiatura o licencia"
            disabled={isPending}
            className={inputClass}
          />
          <FieldError msg={errors.licenseNumber} />
        </div>

        {/* Especialidad */}
        <div>
          <label htmlFor="specialty" className={labelClass}>
            Especialidad
          </label>
          <div className="relative">
            <select
              id="specialty"
              name="specialty"
              aria-label="Especialidad"
              disabled={isPending}
              defaultValue=""
              className={`${inputClass} appearance-none pr-10 cursor-pointer`}
            >
              <option value="" disabled>
                Seleccionar especialidad
              </option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <span
              aria-hidden="true"
              className="material-symbols-outlined absolute inset-y-0 right-3 flex items-center text-[20px] text-secondary pointer-events-none top-1/2 -translate-y-1/2"
            >
              expand_more
            </span>
          </div>
          <FieldError msg={errors.specialty} />
        </div>
      </div>

      {/* Info box */}
      <div className="flex items-start gap-3 bg-surface-container-low rounded-lg p-4">
        <span className="material-symbols-outlined text-primary text-[20px] shrink-0 mt-0.5">
          info
        </span>
        <p className="text-sm text-on-surface-variant leading-relaxed">
          Tu solicitud será revisada por nuestro equipo. Recibirás un correo
          electrónico cuando tu cuenta sea activada.
        </p>
      </div>

      {/* Submit */}
      <div className="pt-2 space-y-4">
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-primary to-primary-container text-white font-semibold text-sm py-4 rounded-lg shadow-md hover:brightness-110 hover:shadow-lg active:scale-[0.98] transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          {isPending ? (
            <>
              <span className="material-symbols-outlined text-[20px] animate-spin">
                progress_activity
              </span>
              Enviando solicitud…
            </>
          ) : (
            "Enviar solicitud"
          )}
        </button>

        <p className="text-center text-sm text-on-surface-variant">
          ¿Ya tienes cuenta?{" "}
          <a href="/login" className="text-primary font-semibold hover:underline transition-colors">
            Inicia sesión
          </a>
        </p>
      </div>
    </form>
  )
}
