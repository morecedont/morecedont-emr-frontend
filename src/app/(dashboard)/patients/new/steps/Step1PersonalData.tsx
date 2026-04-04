"use client"

import { useState, useTransition } from "react"
import { checkDuplicatePatient } from "@/lib/actions/patients"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"

export type PersonalFormData = {
  fullName: string
  idNumber: string
  dateOfBirth: string
  gender: string
  bloodType: string
  occupation: string
  phone: string
  email: string
  address: string
}

interface Step1Props {
  data: PersonalFormData
  onChange: (data: PersonalFormData) => void
  onNext: () => void
  onCancel: () => void
}

export default function Step1PersonalData({ data, onChange, onNext, onCancel }: Step1Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof PersonalFormData, string>>>({})
  const [showDuplicateModal, setShowDuplicateModal] = useState(false)
  const [isChecking, startChecking] = useTransition()

  function set(field: keyof PersonalFormData, value: string) {
    onChange({ ...data, [field]: value })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!data.fullName.trim()) errs.fullName = "El nombre es requerido"
    if (!data.idNumber.trim()) errs.idNumber = "La cédula es requerida"
    if (!data.dateOfBirth) errs.dateOfBirth = "La fecha de nacimiento es requerida"
    if (!data.phone.trim()) errs.phone = "El teléfono es requerido"
    if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errs.email = "Email inválido"
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleNext() {
    if (!validate()) return

    startChecking(async () => {
      const isDuplicate = await checkDuplicatePatient(data.idNumber, data.dateOfBirth)
      if (isDuplicate) {
        setShowDuplicateModal(true)
      } else {
        onNext()
      }
    })
  }

  return (
    <div>
      {/* Form Card */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-surface-container">
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
            Información del paciente
          </h2>
          <p className="text-secondary mt-1 text-sm">
            Complete los datos de identificación legal del nuevo paciente.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
            {/* Full name */}
            <div className="md:col-span-8">
              <label className={labelCls}>
                Nombre completo <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={data.fullName}
                onChange={(e) => set("fullName", e.target.value)}
                placeholder="ej. Juan Alberto Pérez"
                className={`${inputCls} ${errors.fullName ? "border-error focus:border-error" : ""}`}
              />
              {errors.fullName && <p className="text-xs text-error mt-1">{errors.fullName}</p>}
            </div>

            {/* ID number */}
            <div className="md:col-span-4">
              <label className={labelCls}>
                Cédula / ID <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={data.idNumber}
                onChange={(e) => set("idNumber", e.target.value)}
                placeholder="V-12345678"
                className={`${inputCls} ${errors.idNumber ? "border-error focus:border-error" : ""}`}
              />
              {errors.idNumber && <p className="text-xs text-error mt-1">{errors.idNumber}</p>}
            </div>

            {/* DOB */}
            <div className="md:col-span-4">
              <label className={labelCls}>
                Fecha de nacimiento <span className="text-error">*</span>
              </label>
              <input
                type="date"
                value={data.dateOfBirth}
                onChange={(e) => set("dateOfBirth", e.target.value)}
                className={`${inputCls} ${errors.dateOfBirth ? "border-error focus:border-error" : ""}`}
              />
              {errors.dateOfBirth && <p className="text-xs text-error mt-1">{errors.dateOfBirth}</p>}
            </div>

            {/* Gender */}
            <div className="md:col-span-4">
              <label className={labelCls}>Identidad de género</label>
              <select
                value={data.gender}
                onChange={(e) => set("gender", e.target.value)}
                className={selectCls}
              >
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
                <option value="Prefiero no decir">Prefiero no decir</option>
              </select>
            </div>

            {/* Blood type */}
            <div className="md:col-span-4">
              <label className={labelCls}>Tipo de sangre</label>
              <select
                value={data.bloodType}
                onChange={(e) => set("bloodType", e.target.value)}
                className={selectCls}
              >
                <option value="">Desconocido</option>
                <option>A+</option>
                <option>A-</option>
                <option>B+</option>
                <option>B-</option>
                <option>AB+</option>
                <option>AB-</option>
                <option>O+</option>
                <option>O-</option>
              </select>
            </div>

            {/* Occupation */}
            <div className="md:col-span-8">
              <label className={labelCls}>Ocupación / Profesión</label>
              <input
                type="text"
                value={data.occupation}
                onChange={(e) => set("occupation", e.target.value)}
                placeholder="Ej. Médico, Ingeniero, Docente..."
                className={inputCls}
              />
            </div>

            {/* Phone */}
            <div className="md:col-span-6">
              <label className={labelCls}>
                Teléfono <span className="text-error">*</span>
              </label>
              <input
                type="tel"
                value={data.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="+58 (412) 000-0000"
                className={`${inputCls} ${errors.phone ? "border-error focus:border-error" : ""}`}
              />
              {errors.phone && <p className="text-xs text-error mt-1">{errors.phone}</p>}
            </div>

            {/* Email */}
            <div className="md:col-span-6">
              <label className={labelCls}>Correo electrónico</label>
              <input
                type="email"
                value={data.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="paciente@ejemplo.com"
                className={`${inputCls} ${errors.email ? "border-error focus:border-error" : ""}`}
              />
              {errors.email && <p className="text-xs text-error mt-1">{errors.email}</p>}
            </div>

            {/* Address */}
            <div className="md:col-span-12">
              <label className={labelCls}>Dirección de habitación</label>
              <textarea
                value={data.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="Calle, Apartamento, Ciudad, Código Postal"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 sm:px-8 py-5 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all"
          >
            <span className="material-symbols-outlined text-lg">arrow_back</span>
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={isChecking}
            className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60"
          >
            {isChecking ? "Verificando..." : "Continuar al paso 2"}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Info cards */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-primary/5 p-5 rounded-xl border border-primary/10">
          <span className="material-symbols-outlined text-primary mb-2">security</span>
          <h4 className="font-bold text-on-surface mb-1 text-sm">Cumple con privacidad médica</h4>
          <p className="text-xs text-secondary leading-relaxed">
            Todos los datos se encriptan y almacenan conforme a los estándares de privacidad médica.
          </p>
        </div>
        <div className="bg-secondary-container/10 p-5 rounded-xl border border-secondary-container/20">
          <span className="material-symbols-outlined text-secondary mb-2">auto_awesome</span>
          <h4 className="font-bold text-on-surface mb-1 text-sm">Validación inteligente</h4>
          <p className="text-xs text-secondary leading-relaxed">
            El sistema verifica automáticamente duplicados basados en cédula y fecha de nacimiento.
          </p>
        </div>
        <div className="bg-surface-container p-5 rounded-xl">
          <span className="material-symbols-outlined text-outline mb-2">support_agent</span>
          <h4 className="font-bold text-on-surface mb-1 text-sm">¿Necesitas ayuda?</h4>
          <p className="text-xs text-secondary leading-relaxed">
            Contacta al soporte clínico en ext. 404 si encuentras problemas con el formulario.
          </p>
        </div>
      </div>

      {/* Duplicate modal */}
      {showDuplicateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <span className="material-symbols-outlined text-yellow-600">warning</span>
              </div>
              <h3 className="font-bold text-on-surface">Paciente duplicado</h3>
            </div>
            <p className="text-sm text-secondary mb-5">
              Ya existe un paciente con esta cédula y fecha de nacimiento. ¿Deseas continuar de todas formas?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDuplicateModal(false)}
                className="flex-1 h-10 border border-outline-variant/30 rounded-lg text-sm font-semibold text-secondary hover:bg-surface-container transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => { setShowDuplicateModal(false); onNext() }}
                className="flex-1 h-10 bg-sidebar-active text-white rounded-lg text-sm font-bold hover:bg-sidebar-active/90 transition-colors"
              >
                Continuar igual
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
