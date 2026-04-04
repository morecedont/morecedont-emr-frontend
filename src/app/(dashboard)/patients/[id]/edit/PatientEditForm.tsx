"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { updatePatient, type PatientUpdateData } from "@/lib/actions/patients"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"

interface PatientEditFormProps {
  patientId: string
  initialData: PatientUpdateData
}

export default function PatientEditForm({ patientId, initialData }: PatientEditFormProps) {
  const router = useRouter()
  const [form, setForm] = useState<PatientUpdateData>(initialData)
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  function handleChange(field: keyof PatientUpdateData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleSave() {
    if (!form.fullName.trim()) {
      setServerError("El nombre completo es obligatorio.")
      return
    }
    setServerError(null)
    startSaving(async () => {
      const result = await updatePatient(patientId, form)
      if (result.error) {
        setServerError(result.error)
        return
      }
      router.push(`/patients/${patientId}`)
    })
  }

  return (
    <div>
      <div className="p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="md:col-span-2">
            <label className={labelCls}>
              Nombre completo <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Nombre completo"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>DNI / Número de identificación</label>
            <input
              type="text"
              value={form.idNumber}
              onChange={(e) => handleChange("idNumber", e.target.value)}
              placeholder="Ej. V-12345678"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Fecha de nacimiento</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => handleChange("dateOfBirth", e.target.value)}
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Género</label>
            <select
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
              className={selectCls}
            >
              <option value="">Seleccionar</option>
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Tipo de sangre</label>
            <select
              value={form.bloodType}
              onChange={(e) => handleChange("bloodType", e.target.value)}
              className={selectCls}
            >
              <option value="">Seleccionar</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelCls}>Teléfono</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => handleChange("phone", e.target.value)}
              placeholder="+58 412 000 0000"
              className={inputCls}
            />
          </div>

          <div>
            <label className={labelCls}>Correo electrónico</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="correo@ejemplo.com"
              className={inputCls}
            />
          </div>

          <div className="md:col-span-2">
            <label className={labelCls}>Dirección</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => handleChange("address", e.target.value)}
              placeholder="Dirección completa"
              className={inputCls}
            />
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-4 py-3">{serverError}</p>
        )}
      </div>

      <div className="px-6 sm:px-8 py-5 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => router.push(`/patients/${patientId}`)}
          className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Cancelar
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60"
        >
          {isSaving ? "Guardando..." : "Guardar cambios"}
          <span className="material-symbols-outlined text-lg">check</span>
        </button>
      </div>
    </div>
  )
}
