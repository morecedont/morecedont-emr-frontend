"use client"

import { useState, useTransition } from "react"
import { createPatient } from "@/lib/actions/patients"
import type { PersonalFormData } from "./Step1PersonalData"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all appearance-none cursor-pointer"

export type EmergencyFormData = {
  emergencyContact: string
  emergencyPhone: string
  lastDentalVisit: string
  clinicId: string
  currency: string
}

interface Step2Props {
  data: EmergencyFormData
  onChange: (data: EmergencyFormData) => void
  personalData: PersonalFormData
  doctorId: string
  clinics: { id: string; name: string }[]
  onNext: (patientId: string, medicalHistoryId: string) => void
  onBack: () => void
}

export default function Step2EmergencyContact({
  data,
  onChange,
  personalData,
  doctorId,
  clinics,
  onNext,
  onBack,
}: Step2Props) {
  const [errors, setErrors] = useState<Partial<Record<keyof EmergencyFormData, string>>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  function set(field: keyof EmergencyFormData, value: string) {
    onChange({ ...data, [field]: value })
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }))
  }

  function validate(): boolean {
    const errs: typeof errors = {}
    if (!data.emergencyContact.trim()) errs.emergencyContact = "El contacto de emergencia es requerido"
    if (!data.emergencyPhone.trim()) errs.emergencyPhone = "El teléfono de emergencia es requerido"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  function handleSave() {
    if (!validate()) return
    setServerError(null)
    startSaving(async () => {
      const result = await createPatient(
        {
          fullName: personalData.fullName,
          idNumber: personalData.idNumber,
          dateOfBirth: personalData.dateOfBirth,
          gender: personalData.gender,
          bloodType: personalData.bloodType,
          occupation: personalData.occupation,
          phone: personalData.phone,
          email: personalData.email,
          address: personalData.address,
        },
        {
          emergencyContact: data.emergencyContact,
          emergencyPhone: data.emergencyPhone,
          lastDentalVisit: data.lastDentalVisit,
          clinicId: data.clinicId,
          currency: data.currency,
        },
        doctorId
      )

      if (result.error) {
        setServerError(result.error)
        return
      }

      onNext(result.patientId!, result.medicalHistoryId!)
    })
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-surface-container">
        <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">
          Contacto de emergencia y última visita
        </h2>
        <p className="text-secondary mt-1 text-sm">
          Complete los datos de emergencia y clínica antes de guardar el paciente.
        </p>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Emergency contact name */}
          <div>
            <label className={labelCls}>
              Nombre del contacto de emergencia <span className="text-error">*</span>
            </label>
            <input
              type="text"
              value={data.emergencyContact}
              onChange={(e) => set("emergencyContact", e.target.value)}
              placeholder="Nombre completo"
              className={`${inputCls} ${errors.emergencyContact ? "border-error" : ""}`}
            />
            {errors.emergencyContact && (
              <p className="text-xs text-error mt-1">{errors.emergencyContact}</p>
            )}
          </div>

          {/* Emergency contact phone */}
          <div>
            <label className={labelCls}>
              Teléfono de emergencia <span className="text-error">*</span>
            </label>
            <input
              type="tel"
              value={data.emergencyPhone}
              onChange={(e) => set("emergencyPhone", e.target.value)}
              placeholder="+58 (412) 000-0000"
              className={`${inputCls} ${errors.emergencyPhone ? "border-error" : ""}`}
            />
            {errors.emergencyPhone && (
              <p className="text-xs text-error mt-1">{errors.emergencyPhone}</p>
            )}
          </div>

          {/* Last dental visit */}
          <div>
            <label className={labelCls}>Última visita dental</label>
            <input
              type="date"
              value={data.lastDentalVisit}
              onChange={(e) => set("lastDentalVisit", e.target.value)}
              className={inputCls}
            />
          </div>

          {/* Currency */}
          <div>
            <label className={labelCls}>Moneda del presupuesto</label>
            <select
              value={data.currency}
              onChange={(e) => set("currency", e.target.value)}
              className={selectCls}
            >
              <option value="USD">USD — Dólar estadounidense</option>
              <option value="VES">VES — Bolívar venezolano</option>
              <option value="EUR">EUR — Euro</option>
            </select>
          </div>

          {/* Clinic */}
          <div className="md:col-span-2">
            <label className={labelCls}>Clínica</label>
            <select
              value={data.clinicId}
              onChange={(e) => set("clinicId", e.target.value)}
              className={selectCls}
            >
              <option value="">Sin clínica asignada</option>
              {clinics.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-4 py-3">
            {serverError}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 sm:px-8 py-5 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all"
        >
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Atrás
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60"
        >
          {isSaving ? "Guardando paciente..." : "Guardar paciente y continuar →"}
        </button>
      </div>
    </div>
  )
}
