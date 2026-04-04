"use client"

import FileInstrumentation from "@/components/shared/FileInstrumentation"

export type EndoSession = {
  id: string
  session_date: string | null
  activity: string
  notes: string | null
}

export type CanalRecord = {
  id: string
  canal_code: string
  canal_label: string
  reference: string | null
  length_mm: string | null
  notes: string | null
}

export type EndoRecord = {
  id: string
  tooth_number: number
  pain_type: string | null
  pain_intensity: number | null
  pain_quality: string | null
  pain_relief: string | null
  percussion_vertical: string | null
  percussion_horizontal: string | null
  palpation_apical: string | null
  palpation_gum: string | null
  mobility_grade: string | null
  thermal_tests: string | null
  pulp_chamber: string | null
  canals: string | null
  periapical_zone: string | null
  pulp_diagnosis: string | null
  periapical_diagnosis: string | null
  canal_name: string | null
  canal_reference: string | null
  canal_length: string | null
  irrigation_naocl_pct: string | null
  irrigation_edta: boolean | null
  instrumentation: string | null
  obturation: string | null
  file_initial: string | null
  file_final: string | null
  file_length: string | null
  file_notes: string | null
  endodontic_sessions: EndoSession[]
  endodontic_canals: CanalRecord[]
}

interface EndodonticsTabProps {
  records: EndoRecord[]
  patientId: string
  historyId: string
}

const ACTIVITY_LABELS: Record<string, string> = {
  opening: "Apertura",
  biopulpectomy: "Biopulpectomía",
  necropulpectomy: "Necropulpectomía",
  conductometry: "Conductometría",
  instrumentation: "Instrumentación",
  medication: "Medicación",
  conometry: "Conometría",
  obturation: "Obturación",
  coronal_sealing: "Sellado coronal",
  postop_control: "Control post-op",
  distance_control: "Control a distancia",
}

const ACTIVITY_COLORS: Record<string, string> = {
  opening: "bg-blue-50 text-blue-700",
  biopulpectomy: "bg-blue-50 text-blue-700",
  necropulpectomy: "bg-blue-50 text-blue-700",
  conductometry: "bg-purple-50 text-purple-700",
  instrumentation: "bg-purple-50 text-purple-700",
  medication: "bg-yellow-50 text-yellow-700",
  conometry: "bg-orange-50 text-orange-700",
  obturation: "bg-orange-50 text-orange-700",
  coronal_sealing: "bg-orange-50 text-orange-700",
  postop_control: "bg-green-50 text-green-700",
  distance_control: "bg-green-50 text-green-700",
}

const PAIN_TYPE_LABELS: Record<string, string> = { spontaneous: "Espontáneo", provoked: "Provocado" }
const PAIN_QUALITY_LABELS: Record<string, string> = { acute: "Agudo", dull: "Sordo", pulsating: "Pulsátil" }
const PAIN_RELIEF_LABELS: Record<string, string> = { cold: "Frío", heat: "Calor", analgesics: "Analgésicos" }
const PERCUSSION_LABELS: Record<string, string> = { positive: "Positivo", negative: "Negativo" }
const MOBILITY_LABELS: Record<string, string> = { grade_1: "Grado I", grade_2: "Grado II", grade_3: "Grado III" }
const PULP_LABELS: Record<string, string> = { normal: "Normal", calcified: "Calcificada", open: "Abierta" }
const CANAL_LABELS: Record<string, string> = { visible: "Visible", atretic: "Atréticos", curvature: "Curvatura" }
const PERIAPICAL_LABELS: Record<string, string> = { radiolucency: "Radiolucidez", thickened_lp: "LP engrosado" }
const INSTRUMENTATION_LABELS: Record<string, string> = { manual: "Manual", rotary_reciprocating: "Rotatorio / Reciprocante" }
const OBTURATION_LABELS: Record<string, string> = { lateral_condensation: "Condensación lateral", thermoplastic: "Termoplástica" }

function Badge({ label, color = "bg-surface-container text-secondary" }: { label: string; color?: string }) {
  return <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${color}`}>{label}</span>
}

function PainBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: 10 }, (_, i) => (
          <div
            key={i}
            className={`w-4 h-2 rounded-sm ${
              i < value
                ? value <= 3 ? "bg-green-400" : value <= 6 ? "bg-yellow-400" : "bg-red-500"
                : "bg-surface-container"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-bold text-on-surface">{value}/10</span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">{label}</p>
      <p className="text-sm text-on-surface mt-0.5">{value}</p>
    </div>
  )
}

export default function EndodonticsTab({ records, patientId, historyId }: EndodonticsTabProps) {
  if (records.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="material-symbols-outlined text-outline text-5xl">dentistry</span>
        <p className="font-bold text-on-surface mt-3">No hay registros de endodoncia</p>
        <p className="text-sm text-secondary mt-1">Agrega registros de endodoncia para este paciente.</p>
        <a
          href={`/patients/${patientId}/history/${historyId}/edit`}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-sidebar-active text-white text-sm font-semibold rounded-lg"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          Agregar endodoncia
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {records.map((rec) => (
        <div key={rec.id} className="space-y-4">
          {/* Tooth header */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sidebar-active/10 flex items-center justify-center">
              <span className="text-sm font-extrabold text-sidebar-active">{rec.tooth_number}</span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Diente FDI</p>
              <p className="font-extrabold text-on-surface">Pieza #{rec.tooth_number}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Anamnesis */}
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Anamnesis</p>
              {rec.pain_intensity !== null && rec.pain_intensity > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-1">Intensidad del dolor</p>
                  <PainBar value={rec.pain_intensity} />
                </div>
              )}
              <div className="flex flex-wrap gap-1.5">
                {rec.pain_type && <Badge label={PAIN_TYPE_LABELS[rec.pain_type] ?? rec.pain_type} color="bg-orange-50 text-orange-700" />}
                {rec.pain_quality && <Badge label={PAIN_QUALITY_LABELS[rec.pain_quality] ?? rec.pain_quality} color="bg-orange-50 text-orange-700" />}
                {rec.pain_relief && <Badge label={`Alivio: ${PAIN_RELIEF_LABELS[rec.pain_relief] ?? rec.pain_relief}`} color="bg-blue-50 text-blue-700" />}
              </div>
            </div>

            {/* Examen clínico */}
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Examen Clínico</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.percussion_vertical && (
                  <Badge label={`Percusión V: ${PERCUSSION_LABELS[rec.percussion_vertical] ?? rec.percussion_vertical}`} />
                )}
                {rec.percussion_horizontal && (
                  <Badge label={`Percusión H: ${PERCUSSION_LABELS[rec.percussion_horizontal] ?? rec.percussion_horizontal}`} />
                )}
                {rec.palpation_apical && (
                  <Badge label={`Palp. apical: ${PERCUSSION_LABELS[rec.palpation_apical] ?? rec.palpation_apical}`} />
                )}
                {rec.palpation_gum && (
                  <Badge label={`Palp. gingival: ${PERCUSSION_LABELS[rec.palpation_gum] ?? rec.palpation_gum}`} />
                )}
                {rec.mobility_grade && (
                  <Badge label={`Movilidad: ${MOBILITY_LABELS[rec.mobility_grade] ?? rec.mobility_grade}`} color="bg-yellow-50 text-yellow-700" />
                )}
              </div>
              {rec.thermal_tests && <InfoRow label="Pruebas térmicas" value={rec.thermal_tests} />}
            </div>

            {/* Examen radiográfico */}
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Examen Radiográfico</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.pulp_chamber && <Badge label={`Cámara: ${PULP_LABELS[rec.pulp_chamber] ?? rec.pulp_chamber}`} />}
                {rec.canals && <Badge label={`Conductos: ${CANAL_LABELS[rec.canals] ?? rec.canals}`} />}
                {rec.periapical_zone && <Badge label={`Periapical: ${PERIAPICAL_LABELS[rec.periapical_zone] ?? rec.periapical_zone}`} color="bg-red-50 text-red-700" />}
              </div>
            </div>

            {/* Diagnóstico */}
            <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Diagnóstico</p>
              {rec.pulp_diagnosis && <InfoRow label="Diagnóstico pulpar" value={rec.pulp_diagnosis} />}
              {rec.periapical_diagnosis && <InfoRow label="Diagnóstico periapical" value={rec.periapical_diagnosis} />}
            </div>

            {/* Conductometría — multi-canal */}
            <div className="col-span-1 sm:col-span-2 bg-surface-container-low rounded-xl p-4 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Conductometría (LR)</p>
              {rec.endodontic_canals.length === 0 ? (
                <p className="text-sm text-secondary">Sin conductos registrados</p>
              ) : (
                <>
                  {/* Summary bar */}
                  {(() => {
                    const withLen = rec.endodontic_canals.filter((c) => c.length_mm !== null)
                    const nums = withLen.map((c) => parseFloat(c.length_mm!))
                    const avg = nums.length > 0 ? (nums.reduce((s, n) => s + n, 0) / nums.length).toFixed(1) : null
                    const min = nums.length > 0 ? Math.min(...nums) : null
                    const max = nums.length > 0 ? Math.max(...nums) : null
                    return (
                      <div className="bg-primary/5 border border-primary/10 rounded-lg px-4 py-2.5 text-xs text-secondary flex flex-wrap gap-x-4 gap-y-1">
                        <span>Total: <strong className="text-on-surface">{rec.endodontic_canals.length}</strong></span>
                        {avg && <span>Promedio: <strong className="text-on-surface">{avg} mm</strong></span>}
                        {min !== null && <span>Mín: <strong className="text-on-surface">{min} mm</strong></span>}
                        {max !== null && <span>Máx: <strong className="text-on-surface">{max} mm</strong></span>}
                      </div>
                    )
                  })()}

                  {/* Desktop table */}
                  <table className="hidden md:table w-full text-sm">
                    <thead>
                      <tr className="text-xs text-secondary uppercase border-b border-outline-variant/20">
                        <th className="text-left py-2 font-semibold">Canal</th>
                        <th className="text-left py-2 font-semibold">Referencia</th>
                        <th className="text-left py-2 font-semibold">Longitud</th>
                        <th className="text-left py-2 font-semibold">Notas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rec.endodontic_canals.map((canal) => (
                        <tr key={canal.id} className="border-b border-outline-variant/10 hover:bg-surface-container">
                          <td className="py-2 font-semibold text-sidebar-active">{canal.canal_code}</td>
                          <td className="py-2 text-secondary">{canal.reference || "—"}</td>
                          <td className="py-2">
                            {canal.length_mm
                              ? <span className="font-medium text-on-surface">{canal.length_mm} mm</span>
                              : <span className="text-outline">—</span>
                            }
                          </td>
                          <td className="py-2 text-secondary">{canal.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile cards */}
                  <div className="md:hidden space-y-2">
                    {rec.endodontic_canals.map((canal) => (
                      <div key={canal.id} className="bg-white border border-outline-variant/20 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-sidebar-active">{canal.canal_code}</span>
                          {canal.length_mm && (
                            <span className="text-sm font-medium text-on-surface">{canal.length_mm} mm</span>
                          )}
                        </div>
                        {canal.reference && (
                          <p className="text-xs text-secondary">Ref: {canal.reference}</p>
                        )}
                        {canal.notes && (
                          <p className="text-xs text-outline mt-1">{canal.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Preparación biomecánica */}
            <FileInstrumentation
              instrumentationType={rec.instrumentation as "manual" | "rotary_reciprocating" | null}
              fileInitial={rec.file_initial}
              fileFinal={rec.file_final}
              fileLength={rec.file_length ? parseFloat(rec.file_length) : null}
              fileNotes={rec.file_notes}
              onInstrumentationChange={() => {}}
              onFileInitialChange={() => {}}
              onFileFinalChange={() => {}}
              onFileLengthChange={() => {}}
              onFileNotesChange={() => {}}
              readOnly
            />

            {/* Protocolo */}
            {(rec.obturation || rec.irrigation_naocl_pct) && (
              <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-secondary">Protocolo</p>
                <div className="flex flex-wrap gap-1.5">
                  {rec.obturation && <Badge label={OBTURATION_LABELS[rec.obturation] ?? rec.obturation} color="bg-purple-50 text-purple-700" />}
                  {rec.irrigation_naocl_pct && <Badge label={`NaOCl ${rec.irrigation_naocl_pct}%`} color="bg-teal-50 text-teal-700" />}
                  {rec.irrigation_edta && <Badge label="EDTA" color="bg-teal-50 text-teal-700" />}
                </div>
              </div>
            )}
          </div>

          {/* Sessions timeline */}
          {rec.endodontic_sessions.length > 0 && (
            <div className="bg-surface-container-low rounded-xl p-5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-secondary mb-4">Cronograma de sesiones</p>
              <div className="space-y-3">
                {rec.endodontic_sessions.map((s, i) => (
                  <div key={s.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2 h-2 rounded-full bg-sidebar-active mt-1.5 shrink-0" />
                      {i < rec.endodontic_sessions.length - 1 && (
                        <div className="w-px flex-1 bg-outline/20 mt-1" />
                      )}
                    </div>
                    <div className="pb-3">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        {s.session_date && (
                          <span className="text-xs text-secondary">
                            {new Date(s.session_date).toLocaleDateString("es-ES", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        )}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase ${ACTIVITY_COLORS[s.activity] ?? "bg-surface-container text-secondary"}`}>
                          {ACTIVITY_LABELS[s.activity] ?? s.activity}
                        </span>
                      </div>
                      {s.notes && <p className="text-sm text-secondary leading-relaxed">{s.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
