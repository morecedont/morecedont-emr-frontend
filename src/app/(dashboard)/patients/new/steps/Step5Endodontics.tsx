"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { saveEndodontics, type EndodonticData, type EndoSession } from "@/lib/actions/patients"
import CanalRow from "@/components/shared/CanalRow"
import { type CanalEntry } from "@/lib/constants/endodontics"

const inputCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
const labelCls = "block text-sm font-semibold text-on-surface-variant mb-1.5"
const selectCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all appearance-none"

const ENDO_ACTIVITIES = [
  { value: "opening", label: "Apertura" },
  { value: "biopulpectomy", label: "Biopulpectomía" },
  { value: "necropulpectomy", label: "Necropulpectomía" },
  { value: "conductometry", label: "Conductometría" },
  { value: "instrumentation", label: "Instrumentación" },
  { value: "medication", label: "Medicación" },
  { value: "conometry", label: "Conometría" },
  { value: "obturation", label: "Obturación" },
  { value: "coronal_sealing", label: "Sellado coronal" },
  { value: "postop_control", label: "Control post-op" },
  { value: "distance_control", label: "Control a distancia" },
]

function Radio({
  name, value, current, label, onChange,
}: { name: string; value: string; current: string; label: string; onChange: (v: string) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="radio"
        name={name}
        value={value}
        checked={current === value}
        onChange={() => onChange(value)}
        className="text-sidebar-active focus:ring-sidebar-active/20"
      />
      <span className="text-sm text-on-surface">{label}</span>
    </label>
  )
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2">{label}</p>
      {children}
    </div>
  )
}

export type InitialEndoData = {
  toothNumber?: number | null
  painType?: string | null
  painIntensity?: number | null
  painQuality?: string | null
  painRelief?: string | null
  percussionVertical?: string | null
  percussionHorizontal?: string | null
  palpationApical?: string | null
  palpationGum?: string | null
  mobilityGrade?: string | null
  thermalTests?: string | null
  pulpChamber?: string | null
  canals?: string | null
  periapicalZone?: string | null
  pulpDiagnosis?: string | null
  periapicalDiagnosis?: string | null
  canalName?: string | null
  canalReference?: string | null
  canalLength?: string | null
  irrigationNaoclPct?: string | null
  irrigationEdta?: boolean | null
  instrumentation?: string | null
  obturation?: string | null
  sessions?: Array<{ date: string; activity: string; notes: string }>
  endodontic_canals?: CanalEntry[]
}

interface Step5Props {
  medicalHistoryId: string
  patientId: string
  initialData?: InitialEndoData
  onSaveAndExit?: () => void
  onNext: () => void
  onBack: () => void
  onSkip: () => void
}

export default function Step5Endodontics({ medicalHistoryId, patientId, initialData, onSaveAndExit, onNext, onBack, onSkip }: Step5Props) {
  const router = useRouter()
  const [toothNumber, setToothNumber] = useState(initialData?.toothNumber?.toString() ?? "")
  const [painType, setPainType] = useState(initialData?.painType ?? "")
  const [painIntensity, setPainIntensity] = useState(initialData?.painIntensity ?? 5)
  const [painQuality, setPainQuality] = useState(initialData?.painQuality ?? "")
  const [painRelief, setPainRelief] = useState(initialData?.painRelief ?? "")
  const [percV, setPercV] = useState(initialData?.percussionVertical ?? "")
  const [percH, setPercH] = useState(initialData?.percussionHorizontal ?? "")
  const [palA, setPalA] = useState(initialData?.palpationApical ?? "")
  const [palG, setPalG] = useState(initialData?.palpationGum ?? "")
  const [mobility, setMobility] = useState(initialData?.mobilityGrade ?? "")
  const [thermalTests, setThermalTests] = useState(initialData?.thermalTests ?? "")
  const [pulpChamber, setPulpChamber] = useState(initialData?.pulpChamber ?? "")
  const [canals, setCanals] = useState(initialData?.canals ?? "")
  const [periapical, setPeriapical] = useState(initialData?.periapicalZone ?? "")
  const [pulpDx, setPulpDx] = useState(initialData?.pulpDiagnosis ?? "")
  const [periapicalDx, setPeriapicalDx] = useState(initialData?.periapicalDiagnosis ?? "")
  const [canalEntries, setCanalEntries] = useState<CanalEntry[]>(() => initialData?.endodontic_canals ?? [])
  const [naocl, setNaocl] = useState(initialData?.irrigationNaoclPct ?? "")
  const [edta, setEdta] = useState(initialData?.irrigationEdta ?? false)
  const [instrumentation, setInstrumentation] = useState(initialData?.instrumentation ?? "")
  const [obturation, setObturation] = useState(initialData?.obturation ?? "")
  const [sessions, setSessions] = useState<EndoSession[]>(
    initialData?.sessions?.length
      ? initialData.sessions
      : [{ date: "", activity: "", notes: "" }]
  )
  const [serverError, setServerError] = useState<string | null>(null)
  const [isSaving, startSaving] = useTransition()

  function addCanalEntry() {
    setCanalEntries((prev) => [...prev, { canal_code: "", canal_label: "", reference: "", length_mm: null, notes: "" }])
  }

  function updateCanalEntry(index: number, field: keyof CanalEntry, value: string | number | null) {
    setCanalEntries((prev) => prev.map((c, i) => i === index ? { ...c, [field]: value } : c))
  }

  function removeCanalEntry(index: number) {
    setCanalEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function addSession() {
    setSessions((prev) => [...prev, { date: "", activity: "", notes: "" }])
  }

  function updateSession(i: number, field: keyof EndoSession, value: string) {
    setSessions((prev) => prev.map((s, idx) => idx === i ? { ...s, [field]: value } : s))
  }

  function removeSession(i: number) {
    setSessions((prev) => prev.filter((_, idx) => idx !== i))
  }

  function buildData(): EndodonticData {
    return {
      toothNumber: parseInt(toothNumber) || 0,
      painType: painType || null,
      painIntensity,
      painQuality: painQuality || null,
      painRelief: painRelief || null,
      percussionVertical: percV || null,
      percussionHorizontal: percH || null,
      palpationApical: palA || null,
      palpationGum: palG || null,
      mobilityGrade: mobility || null,
      thermalTests,
      pulpChamber: pulpChamber || null,
      canals: canals || null,
      periapicalZone: periapical || null,
      pulpDiagnosis: pulpDx,
      periapicalDiagnosis: periapicalDx,
      canalName: "",
      canalReference: "",
      canalLength: "",
      irrigationNaoclPct: naocl ? parseFloat(naocl) : null,
      irrigationEdta: edta,
      instrumentation: instrumentation || null,
      obturation: obturation || null,
    }
  }

  function handleNext() {
    if (!toothNumber) return
    setServerError(null)
    startSaving(async () => {
      const result = await saveEndodontics(medicalHistoryId, buildData(), sessions, canalEntries)
      if (result.error) { setServerError(result.error); return }
      onNext()
    })
  }

  function handleSaveAndExit() {
    const exitFn = onSaveAndExit ?? (() => router.push(`/patients/${patientId}`))
    if (!toothNumber) { exitFn(); return }
    setServerError(null)
    startSaving(async () => {
      await saveEndodontics(medicalHistoryId, buildData(), sessions, canalEntries)
      exitFn()
    })
  }

  const sectionCard = "bg-surface-container-low rounded-xl p-5 space-y-4"

  return (
    <div className="bg-white rounded-xl shadow-sm border border-outline-variant/10 overflow-hidden">
      <div className="p-6 sm:p-8 border-b border-surface-container flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-on-surface tracking-tight">Endodoncia</h2>
          <p className="text-secondary mt-1 text-sm">Registro del tratamiento endodóntico por pieza dental.</p>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="text-sm text-secondary hover:text-on-surface underline shrink-0"
        >
          Omitir este paso
        </button>
      </div>

      <div className="p-6 sm:p-8 space-y-6">
        {/* Tooth number */}
        <div className="max-w-xs">
          <label className={labelCls}>
            Número de pieza dental <span className="text-error">*</span>
          </label>
          <input
            type="number"
            value={toothNumber}
            onChange={(e) => setToothNumber(e.target.value)}
            placeholder="ej. 36"
            min={11}
            max={48}
            className={inputCls}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Anamnesis */}
          <div className={sectionCard}>
            <h3 className="font-bold text-on-surface">Anamnesis</h3>
            <FieldGroup label="Tipo de dolor">
              <div className="flex gap-4">
                <Radio name="painType" value="spontaneous" current={painType} label="Espontáneo" onChange={setPainType} />
                <Radio name="painType" value="provoked" current={painType} label="Provocado" onChange={setPainType} />
              </div>
            </FieldGroup>
            <FieldGroup label={`Intensidad: ${painIntensity}/10`}>
              <input
                type="range"
                min={1}
                max={10}
                value={painIntensity}
                onChange={(e) => setPainIntensity(parseInt(e.target.value))}
                className="w-full accent-sidebar-active"
              />
            </FieldGroup>
            <FieldGroup label="Calidad">
              <div className="flex gap-3 flex-wrap">
                <Radio name="pq" value="acute" current={painQuality} label="Agudo" onChange={setPainQuality} />
                <Radio name="pq" value="dull" current={painQuality} label="Sordo" onChange={setPainQuality} />
                <Radio name="pq" value="pulsating" current={painQuality} label="Pulsátil" onChange={setPainQuality} />
              </div>
            </FieldGroup>
            <FieldGroup label="Alivio con">
              <div className="flex gap-3 flex-wrap">
                <Radio name="pr" value="cold" current={painRelief} label="Frío" onChange={setPainRelief} />
                <Radio name="pr" value="heat" current={painRelief} label="Calor" onChange={setPainRelief} />
                <Radio name="pr" value="analgesics" current={painRelief} label="Analgésicos" onChange={setPainRelief} />
              </div>
            </FieldGroup>
          </div>

          {/* Clinical exam */}
          <div className={sectionCard}>
            <h3 className="font-bold text-on-surface">Examen clínico</h3>
            <FieldGroup label="Percusión vertical">
              <div className="flex gap-4">
                <Radio name="percV" value="positive" current={percV} label="+" onChange={setPercV} />
                <Radio name="percV" value="negative" current={percV} label="-" onChange={setPercV} />
              </div>
            </FieldGroup>
            <FieldGroup label="Percusión horizontal">
              <div className="flex gap-4">
                <Radio name="percH" value="positive" current={percH} label="+" onChange={setPercH} />
                <Radio name="percH" value="negative" current={percH} label="-" onChange={setPercH} />
              </div>
            </FieldGroup>
            <FieldGroup label="Palpación apical">
              <div className="flex gap-4">
                <Radio name="palA" value="positive" current={palA} label="+" onChange={setPalA} />
                <Radio name="palA" value="negative" current={palA} label="-" onChange={setPalA} />
              </div>
            </FieldGroup>
            <FieldGroup label="Palpación encía">
              <div className="flex gap-4">
                <Radio name="palG" value="positive" current={palG} label="+" onChange={setPalG} />
                <Radio name="palG" value="negative" current={palG} label="-" onChange={setPalG} />
              </div>
            </FieldGroup>
            <FieldGroup label="Movilidad">
              <div className="flex gap-3">
                <Radio name="mob" value="grade_1" current={mobility} label="Grado I" onChange={setMobility} />
                <Radio name="mob" value="grade_2" current={mobility} label="Grado II" onChange={setMobility} />
                <Radio name="mob" value="grade_3" current={mobility} label="Grado III" onChange={setMobility} />
              </div>
            </FieldGroup>
            <div>
              <label className={labelCls}>Pruebas térmicas</label>
              <input type="text" value={thermalTests} onChange={(e) => setThermalTests(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Radiographic exam */}
          <div className={sectionCard}>
            <h3 className="font-bold text-on-surface">Examen radiográfico</h3>
            <div>
              <label className={labelCls}>Cámara pulpar</label>
              <select value={pulpChamber} onChange={(e) => setPulpChamber(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option value="normal">Normal</option>
                <option value="calcified">Calcificada</option>
                <option value="open">Abierta</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Conductos</label>
              <select value={canals} onChange={(e) => setCanals(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option value="visible">Visibles</option>
                <option value="atretic">Atresiados</option>
                <option value="curvature">Curvatura</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Zona periapical</label>
              <select value={periapical} onChange={(e) => setPeriapical(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option value="radiolucency">Radiolucidez</option>
                <option value="thickened_lp">L.P. Engrosado</option>
              </select>
            </div>
          </div>

          {/* Diagnosis */}
          <div className={sectionCard}>
            <h3 className="font-bold text-on-surface">Diagnóstico</h3>
            <div>
              <label className={labelCls}>Pulpar</label>
              <input type="text" value={pulpDx} onChange={(e) => setPulpDx(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Periapical</label>
              <input type="text" value={periapicalDx} onChange={(e) => setPeriapicalDx(e.target.value)} className={inputCls} />
            </div>
          </div>

          {/* Conductometry — multi-canal */}
          <div className="col-span-1 md:col-span-2 bg-surface-container-low rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-on-surface">Conductometría (LR)</h3>
              {canalEntries.length > 0 && (
                <button
                  type="button"
                  onClick={addCanalEntry}
                  className="hidden md:flex h-9 px-4 items-center gap-2 text-sm font-semibold text-sidebar-active border border-sidebar-active/30 rounded-lg hover:bg-sidebar-active/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar conducto
                </button>
              )}
            </div>

            {canalEntries.length === 0 ? (
              <button
                type="button"
                onClick={addCanalEntry}
                className="w-full py-8 border-2 border-dashed border-outline-variant/40 rounded-xl flex flex-col items-center gap-2 text-secondary hover:border-sidebar-active/40 hover:text-sidebar-active transition-colors"
              >
                <span className="material-symbols-outlined text-3xl">add_circle</span>
                <span className="text-sm font-semibold">Agregar primer conducto</span>
              </button>
            ) : (
              <>
                <div className="space-y-3">
                  {canalEntries.map((canal, i) => (
                    <CanalRow
                      key={i}
                      canal={canal}
                      index={i}
                      onChange={updateCanalEntry}
                      onRemove={removeCanalEntry}
                    />
                  ))}
                </div>

                {/* Summary stats */}
                {(() => {
                  const withLen = canalEntries.filter((c) => c.length_mm !== null)
                  const avg = withLen.length > 0
                    ? (withLen.reduce((s, c) => s + c.length_mm!, 0) / withLen.length).toFixed(1)
                    : null
                  const min = withLen.length > 0 ? Math.min(...withLen.map((c) => c.length_mm!)) : null
                  const max = withLen.length > 0 ? Math.max(...withLen.map((c) => c.length_mm!)) : null
                  return (
                    <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2.5 text-xs text-secondary flex flex-wrap gap-x-4 gap-y-1">
                      <span>Total: <strong className="text-on-surface">{canalEntries.length}</strong></span>
                      {avg && <span>Promedio: <strong className="text-on-surface">{avg} mm</strong></span>}
                      {min !== null && <span>Mín: <strong className="text-on-surface">{min} mm</strong></span>}
                      {max !== null && <span>Máx: <strong className="text-on-surface">{max} mm</strong></span>}
                    </div>
                  )
                })()}

                <button
                  type="button"
                  onClick={addCanalEntry}
                  className="w-full md:w-auto h-9 px-4 flex items-center justify-center gap-2 text-sm font-semibold text-sidebar-active border border-sidebar-active/30 rounded-lg hover:bg-sidebar-active/5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Agregar otro conducto
                </button>
              </>
            )}
          </div>

          {/* Protocol */}
          <div className={sectionCard}>
            <h3 className="font-bold text-on-surface">Protocolo</h3>
            <div>
              <label className={labelCls}>NaOCl %</label>
              <input type="number" step="0.5" min={0} max={6} value={naocl} onChange={(e) => setNaocl(e.target.value)} className={inputCls} />
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={edta} onChange={(e) => setEdta(e.target.checked)} className="w-4 h-4 rounded text-sidebar-active" />
              <span className="text-sm text-on-surface">EDTA</span>
            </label>
            <div>
              <label className={labelCls}>Instrumentación</label>
              <select value={instrumentation} onChange={(e) => setInstrumentation(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option value="manual">Manual</option>
                <option value="rotary_reciprocating">Rotatoria</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Obturación</label>
              <select value={obturation} onChange={(e) => setObturation(e.target.value)} className={selectCls}>
                <option value="">Seleccionar</option>
                <option value="lateral_condensation">Condensación Lateral</option>
                <option value="thermoplastic">Termoplástica</option>
              </select>
            </div>
          </div>
        </div>

        {/* Chronogram / Sessions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-on-surface">Cronograma de sesiones</h3>
            <button
              type="button"
              onClick={addSession}
              className="h-9 px-4 flex items-center gap-2 text-sm font-semibold text-sidebar-active border border-sidebar-active/30 rounded-lg hover:bg-sidebar-active/5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add</span>
              Agregar sesión
            </button>
          </div>
          <div className="space-y-3">
            {sessions.map((s, i) => (
              <div key={i} className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-surface-container-low rounded-xl">
                <div>
                  <label className={labelCls}>Fecha</label>
                  <input type="date" value={s.date} onChange={(e) => updateSession(i, "date", e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>Actividad</label>
                  <select value={s.activity} onChange={(e) => updateSession(i, "activity", e.target.value)} className={selectCls}>
                    <option value="">Seleccionar</option>
                    {ENDO_ACTIVITIES.map((a) => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="relative">
                  <label className={labelCls}>Notas</label>
                  <input type="text" value={s.notes} onChange={(e) => updateSession(i, "notes", e.target.value)} className={inputCls} />
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSession(i)}
                      className="absolute top-0 right-0 text-error hover:text-error/70 text-xs font-bold"
                    >
                      Quitar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {serverError && (
          <p className="text-sm text-error bg-error-container/20 rounded-lg px-4 py-3">{serverError}</p>
        )}
      </div>

      {/* Actions */}
      <div className="px-6 sm:px-8 py-5 border-t border-surface-container flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button type="button" onClick={onBack} className="h-11 px-6 flex items-center justify-center gap-2 text-secondary font-semibold hover:bg-surface-container rounded-lg transition-all">
          <span className="material-symbols-outlined text-lg">arrow_back</span>
          Atrás
        </button>
        <div className="flex flex-col sm:flex-row gap-3">
          <button type="button" onClick={handleSaveAndExit} disabled={isSaving} className="h-11 px-6 flex items-center justify-center gap-2 border border-outline-variant/30 text-secondary font-semibold rounded-lg hover:bg-surface-container transition-all disabled:opacity-60">
            Guardar y salir
          </button>
          <button type="button" onClick={handleNext} disabled={isSaving} className="h-11 px-8 flex items-center justify-center gap-2 bg-sidebar-active text-white font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-sidebar-active/90 transition-all disabled:opacity-60">
            {isSaving ? "Guardando..." : "Guardar y continuar"}
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>
        </div>
      </div>
    </div>
  )
}
