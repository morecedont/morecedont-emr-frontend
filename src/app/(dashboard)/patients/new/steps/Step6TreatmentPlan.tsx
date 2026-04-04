"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveTreatmentPlan, type TreatmentItem, type TreatmentPayment } from "@/lib/actions/patients"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
const labelCls = "block text-xs font-semibold text-on-surface-variant mb-1"

interface Step6Props {
  medicalHistoryId: string
  patientId: string
  currency: string
  initialItems?: ItemRow[]
  initialPayments?: PaymentRow[]
  onComplete?: () => void
  onBack: () => void
}

export type ItemRow = { description: string; cost: string }
export type PaymentRow = { date: string; toothUnit: string; clinicalActivity: string; cost: string; payment: string }

export default function Step6TreatmentPlan({ medicalHistoryId, patientId, currency, initialItems, initialPayments, onComplete, onBack }: Step6Props) {
  const router = useRouter()
  const [items, setItems] = useState<ItemRow[]>(initialItems ?? [{ description: "", cost: "" }])
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments ?? [{ date: "", toothUnit: "", clinicalActivity: "", cost: "", payment: "" }])
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [isSaving, startSaving] = useTransition()

  // Items helpers
  function addItem() {
    if (items.length >= 33) return
    setItems((prev) => [...prev, { description: "", cost: "" }])
  }
  function updateItem(i: number, field: keyof ItemRow, value: string) {
    setItems((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }
  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Payments helpers
  function addPayment() {
    setPayments((prev) => [...prev, { date: "", toothUnit: "", clinicalActivity: "", cost: "", payment: "" }])
  }
  function updatePayment(i: number, field: keyof PaymentRow, value: string) {
    setPayments((prev) => prev.map((row, idx) => idx === i ? { ...row, [field]: value } : row))
  }
  function removePayment(i: number) {
    setPayments((prev) => prev.filter((_, idx) => idx !== i))
  }

  const totalCost = items.reduce((sum, r) => sum + (parseFloat(r.cost) || 0), 0)
  const totalBalance = payments.reduce((sum, r) => {
    const cost = parseFloat(r.cost) || 0
    const payment = parseFloat(r.payment) || 0
    return sum + (cost - payment)
  }, 0)

  function buildItems(): TreatmentItem[] {
    return items.map((r, i) => ({
      itemNumber: i + 1,
      description: r.description,
      cost: parseFloat(r.cost) || 0,
    }))
  }

  function buildPayments(): TreatmentPayment[] {
    return payments.map((r) => ({
      date: r.date,
      toothUnit: r.toothUnit,
      clinicalActivity: r.clinicalActivity,
      cost: parseFloat(r.cost) || 0,
      payment: parseFloat(r.payment) || 0,
    }))
  }

  function handleSave(exit: boolean) {
    setServerError(null)
    startSaving(async () => {
      const result = await saveTreatmentPlan(medicalHistoryId, buildItems(), buildPayments())
      if (result.error) { setServerError(result.error); return }
      if (onComplete) {
        onComplete()
      } else if (exit) {
        router.push(`/patients/${patientId}`)
      } else {
        setSuccess(true)
        setTimeout(() => router.push(`/patients/${patientId}`), 1500)
      }
    })
  }

  if (success) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 p-12 flex flex-col items-center justify-center text-center gap-4">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
          <span className="material-symbols-outlined text-green-600 text-4xl">check_circle</span>
        </div>
        <h2 className="text-xl font-bold text-on-surface">Historia clínica guardada</h2>
        <p className="text-secondary text-sm">Redirigiendo al expediente del paciente...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Section A — Treatment items */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-surface-container flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-on-surface">Plan de tratamiento</h2>
            <p className="text-secondary mt-0.5 text-sm">Lista de procedimientos y costos.</p>
          </div>
          <span className="text-xs font-bold text-secondary bg-surface-container px-3 py-1.5 rounded-full">
            {currency}
          </span>
        </div>

        <div className="p-6 sm:p-8">
          {/* Table header — desktop */}
          <div className="hidden md:grid grid-cols-[40px_1fr_140px_40px] gap-3 px-3 mb-2">
            <p className={labelCls}>#</p>
            <p className={labelCls}>Descripción del procedimiento</p>
            <p className={labelCls}>Costo ({currency})</p>
            <span />
          </div>

          <div className="space-y-2">
            {items.map((row, i) => (
              <div key={i} className="grid grid-cols-1 md:grid-cols-[40px_1fr_140px_40px] gap-2 md:gap-3 items-end p-3 md:p-0 bg-surface-container-low md:bg-transparent rounded-xl md:rounded-none">
                {/* Mobile label */}
                <p className="text-xs font-bold text-secondary md:hidden">Procedimiento {i + 1}</p>
                <div className="hidden md:flex items-center justify-center h-10 text-sm font-bold text-secondary">
                  {i + 1}
                </div>
                <input
                  type="text"
                  value={row.description}
                  onChange={(e) => updateItem(i, "description", e.target.value)}
                  placeholder="Descripción del procedimiento"
                  className={inputCls}
                />
                <input
                  type="number"
                  value={row.cost}
                  onChange={(e) => updateItem(i, "cost", e.target.value)}
                  placeholder="0.00"
                  min={0}
                  step="0.01"
                  className={inputCls}
                />
                <button
                  type="button"
                  onClick={() => removeItem(i)}
                  className="h-10 flex items-center justify-center text-error hover:bg-error/10 rounded-lg transition-colors"
                  aria-label="Eliminar fila"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
            <button
              type="button"
              onClick={addItem}
              disabled={items.length >= 33}
              className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-sidebar-active border border-sidebar-active/30 rounded-lg hover:bg-sidebar-active/5 transition-colors disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Agregar procedimiento
            </button>
            <p className="text-sm font-bold text-on-surface">
              Total:{" "}
              <span className="text-sidebar-active">
                {currency} {totalCost.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Section B — Payments */}
      <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-surface-container">
          <h2 className="text-xl font-bold text-on-surface">Registro de pagos</h2>
        </div>

        <div className="p-6 sm:p-8">
          {/* Desktop header */}
          <div className="hidden md:grid grid-cols-[120px_80px_1fr_100px_100px_100px_36px] gap-2 px-3 mb-2">
            {["Fecha", "U.D.", "Actividad clínica", `Costo (${currency})`, `Abono (${currency})`, "Saldo", ""].map((h) => (
              <p key={h} className={labelCls}>{h}</p>
            ))}
          </div>

          <div className="space-y-2">
            {payments.map((row, i) => {
              const balance = (parseFloat(row.cost) || 0) - (parseFloat(row.payment) || 0)
              return (
                <div key={i} className="grid grid-cols-1 md:grid-cols-[120px_80px_1fr_100px_100px_100px_36px] gap-2 items-end p-3 md:p-0 bg-surface-container-low md:bg-transparent rounded-xl md:rounded-none">
                  <input type="date" value={row.date} onChange={(e) => updatePayment(i, "date", e.target.value)} className={inputCls} />
                  <input type="text" value={row.toothUnit} onChange={(e) => updatePayment(i, "toothUnit", e.target.value)} placeholder="U.D." className={inputCls} />
                  <input type="text" value={row.clinicalActivity} onChange={(e) => updatePayment(i, "clinicalActivity", e.target.value)} placeholder="Actividad" className={inputCls} />
                  <input type="number" value={row.cost} onChange={(e) => updatePayment(i, "cost", e.target.value)} placeholder="0.00" min={0} step="0.01" className={inputCls} />
                  <input type="number" value={row.payment} onChange={(e) => updatePayment(i, "payment", e.target.value)} placeholder="0.00" min={0} step="0.01" className={inputCls} />
                  <div className={`h-10 flex items-center px-3 rounded-lg text-sm font-bold ${balance > 0 ? "text-error bg-error-container/20" : "text-green-700 bg-green-50"}`}>
                    {balance.toFixed(2)}
                  </div>
                  <button type="button" onClick={() => removePayment(i)} className="h-10 flex items-center justify-center text-error hover:bg-error/10 rounded-lg transition-colors">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-4 pt-4 border-t border-outline-variant/10">
            <button type="button" onClick={addPayment} className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-sidebar-active border border-sidebar-active/30 rounded-lg hover:bg-sidebar-active/5 transition-colors">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Agregar pago
            </button>
            <p className="text-sm font-bold text-on-surface">
              Saldo total:{" "}
              <span className={totalBalance > 0 ? "text-error" : "text-green-600"}>
                {currency} {totalBalance.toFixed(2)}
              </span>
            </p>
          </div>
        </div>
      </div>

      {serverError && (
        <p className="text-sm text-error bg-error-container/20 rounded-lg px-4 py-3">{serverError}</p>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all bg-white border border-outline-variant/20">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Atrás
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={() => handleSave(true)} disabled={isSaving} className="h-11 px-6 flex items-center justify-center gap-2 border border-outline-variant/30 text-secondary font-semibold rounded-lg hover:bg-surface-container transition-all bg-white disabled:opacity-60">
            Guardar y salir
          </button>
          <button type="button" onClick={() => handleSave(false)} disabled={isSaving} className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60">
            {isSaving ? "Guardando..." : "Guardar historia clínica completa"}
            <span className="material-symbols-outlined text-lg">check</span>
          </button>
        </div>
      </div>
    </div>
  )
}
