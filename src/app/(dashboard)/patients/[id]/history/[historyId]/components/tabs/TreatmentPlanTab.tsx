"use client"

import { useState, useTransition } from "react"
import { addPayment } from "@/lib/actions/payments"

export type TreatmentItem = {
  id: string
  item_number: number
  description: string
  cost: string
}

export type TreatmentPayment = {
  id: string
  payment_date: string
  tooth_unit: string | null
  clinical_activity: string
  cost: string
  payment: string
  balance: string | null
}

interface TreatmentPlanTabProps {
  items: TreatmentItem[]
  payments: TreatmentPayment[]
  currency: string
  historyId: string
}

function fmt(val: string): string {
  const n = parseFloat(val)
  return isNaN(n) ? "0.00" : n.toFixed(2)
}

export default function TreatmentPlanTab({ items, payments, currency, historyId }: TreatmentPlanTabProps) {
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    payment_date: new Date().toISOString().slice(0, 10),
    tooth_unit: "",
    clinical_activity: "",
    cost: "",
    payment: "",
  })

  const totalCost = items.reduce((acc, i) => acc + parseFloat(i.cost), 0)
  const totalPaid = payments.reduce((acc, p) => acc + parseFloat(p.payment), 0)
  const totalBalance = totalCost - totalPaid

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await addPayment(historyId, {
        date: form.payment_date,
        toothUnit: form.tooth_unit,
        clinicalActivity: form.clinical_activity,
        cost: parseFloat(form.cost) || 0,
        payment: parseFloat(form.payment) || 0,
      })
      if (result.error) {
        setError(result.error)
      } else {
        setShowForm(false)
        setForm({ payment_date: new Date().toISOString().slice(0, 10), tooth_unit: "", clinical_activity: "", cost: "", payment: "" })
        window.location.reload()
      }
    })
  }

  return (
    <div className="space-y-6">
      {/* Treatment items */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-extrabold text-on-surface">Plan de tratamiento</h3>
          <span className="text-xs text-secondary font-semibold">{currency}</span>
        </div>

        {items.length === 0 ? (
          <div className="px-5 pb-6 text-center">
            <p className="text-sm text-secondary">Sin ítems de tratamiento registrados.</p>
          </div>
        ) : (
          <>
            {/* Desktop/tablet table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline/10">
                    <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary w-10">#</th>
                    <th className="text-left px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Descripción</th>
                    <th className="text-right px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Costo ({currency})</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-outline/10 last:border-0">
                      <td className="px-5 py-3 text-secondary font-medium">{item.item_number}</td>
                      <td className="px-5 py-3 text-on-surface">{item.description}</td>
                      <td className="px-5 py-3 text-right font-semibold text-on-surface">{fmt(item.cost)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-outline/20">
                    <td colSpan={2} className="px-5 py-3 text-right font-extrabold text-on-surface">Total</td>
                    <td className="px-5 py-3 text-right font-extrabold text-on-surface">{totalCost.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-outline/10">
              {items.map((item) => (
                <div key={item.id} className="px-5 py-3 flex justify-between">
                  <div>
                    <span className="text-[10px] text-secondary font-bold mr-2">#{item.item_number}</span>
                    <span className="text-sm text-on-surface">{item.description}</span>
                  </div>
                  <span className="text-sm font-semibold text-on-surface shrink-0 ml-4">{fmt(item.cost)}</span>
                </div>
              ))}
              <div className="px-5 py-3 flex justify-between font-extrabold">
                <span className="text-on-surface">Total</span>
                <span className="text-on-surface">{totalCost.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment history */}
      <div className="bg-surface-container-low rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h3 className="font-extrabold text-on-surface">Historial de pagos</h3>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-sidebar-active text-white text-xs font-semibold rounded-lg"
          >
            <span className="material-symbols-outlined text-[14px]">add</span>
            Agregar pago
          </button>
        </div>

        {/* Inline add form */}
        {showForm && (
          <form onSubmit={handleSubmit} className="mx-5 mb-4 p-4 bg-surface-container rounded-xl space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary mb-2">Nuevo pago</p>
            {error && <p className="text-xs text-error">{error}</p>}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="col-span-2 sm:col-span-1">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Fecha</label>
                <input
                  type="date"
                  value={form.payment_date}
                  onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
                  className="w-full h-9 px-3 text-sm bg-surface border border-outline/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-active"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">U.D.</label>
                <input
                  type="text"
                  value={form.tooth_unit}
                  onChange={(e) => setForm((f) => ({ ...f, tooth_unit: e.target.value }))}
                  placeholder="Ej: 14"
                  className="w-full h-9 px-3 text-sm bg-surface border border-outline/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-active"
                />
              </div>
              <div className="col-span-2 sm:col-span-3">
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Actividad clínica</label>
                <input
                  type="text"
                  value={form.clinical_activity}
                  onChange={(e) => setForm((f) => ({ ...f, clinical_activity: e.target.value }))}
                  placeholder="Ej: Endodoncia pieza 14"
                  className="w-full h-9 px-3 text-sm bg-surface border border-outline/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-active"
                  required
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Costo</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost}
                  onChange={(e) => setForm((f) => ({ ...f, cost: e.target.value }))}
                  placeholder="0.00"
                  className="w-full h-9 px-3 text-sm bg-surface border border-outline/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-active"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-secondary block mb-1">Abono</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.payment}
                  onChange={(e) => setForm((f) => ({ ...f, payment: e.target.value }))}
                  placeholder="0.00"
                  className="w-full h-9 px-3 text-sm bg-surface border border-outline/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-sidebar-active"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="h-9 px-4 text-sm font-semibold text-secondary border border-outline/20 rounded-lg"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="h-9 px-4 text-sm font-semibold bg-sidebar-active text-white rounded-lg disabled:opacity-60"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        )}

        {payments.length === 0 ? (
          <div className="px-5 pb-6 text-center">
            <p className="text-sm text-secondary">Sin pagos registrados.</p>
          </div>
        ) : (
          <>
            {/* Desktop/tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-outline/10">
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Fecha</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">U.D.</th>
                    <th className="text-left px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Actividad clínica</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Costo</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Abono</th>
                    <th className="text-right px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-secondary">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => {
                    const bal = p.balance !== null ? parseFloat(p.balance) : parseFloat(p.cost) - parseFloat(p.payment)
                    return (
                      <tr key={p.id} className="border-b border-outline/10 last:border-0">
                        <td className="px-4 py-3 text-secondary whitespace-nowrap">
                          {new Date(p.payment_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                        </td>
                        <td className="px-4 py-3 text-secondary">{p.tooth_unit ?? "—"}</td>
                        <td className="px-4 py-3 text-on-surface">{p.clinical_activity}</td>
                        <td className="px-4 py-3 text-right text-on-surface">{fmt(p.cost)}</td>
                        <td className="px-4 py-3 text-right text-on-surface">{fmt(p.payment)}</td>
                        <td className={`px-4 py-3 text-right font-semibold ${bal <= 0 ? "text-green-600" : "text-error"}`}>
                          {bal.toFixed(2)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t-2 border-outline/20">
                    <td colSpan={3} className="px-4 py-3 text-right font-extrabold text-on-surface">Totales</td>
                    <td className="px-4 py-3 text-right font-extrabold text-on-surface">{totalCost.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-on-surface">{totalPaid.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-right font-extrabold ${totalBalance <= 0 ? "text-green-600" : "text-error"}`}>
                      {totalBalance.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-outline/10">
              {payments.map((p) => {
                const bal = p.balance !== null ? parseFloat(p.balance) : parseFloat(p.cost) - parseFloat(p.payment)
                return (
                  <div key={p.id} className="px-5 py-3 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-xs text-secondary">
                        {new Date(p.payment_date).toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" })}
                      </span>
                      {p.tooth_unit && <span className="text-xs text-secondary">U.D. {p.tooth_unit}</span>}
                    </div>
                    <p className="text-sm text-on-surface">{p.clinical_activity}</p>
                    <div className="flex gap-4 text-xs">
                      <span className="text-secondary">Costo: {fmt(p.cost)}</span>
                      <span className="text-secondary">Abono: {fmt(p.payment)}</span>
                      <span className={`font-semibold ${bal <= 0 ? "text-green-600" : "text-error"}`}>
                        Saldo: {bal.toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
              <div className="px-5 py-3 grid grid-cols-3 gap-2 text-xs font-bold">
                <span>Total: {totalCost.toFixed(2)}</span>
                <span>Abonado: {totalPaid.toFixed(2)}</span>
                <span className={totalBalance <= 0 ? "text-green-600" : "text-error"}>Saldo: {totalBalance.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
