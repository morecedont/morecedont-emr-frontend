export type CanalEntry = {
  id?: string
  canal_code: string
  canal_label: string
  reference: string
  length_mm: number | null
  notes: string
}

export const CANAL_CODES = [
  { code: "P",      label: "P — Palatino" },
  { code: "B",      label: "B — Vestibular" },
  { code: "MB",     label: "MB — Mesio-vestibular" },
  { code: "MB2",    label: "MB2 — Mesial 2" },
  { code: "DV",     label: "DV — Disto-vestibular" },
  { code: "V",      label: "V — Vestibular" },
  { code: "D",      label: "D — Distal" },
  { code: "M",      label: "M — Mesial" },
  { code: "MV",     label: "MV — Mesio-vestibular" },
  { code: "ML",     label: "ML — Mesio-lingual" },
  { code: "custom", label: "Otro (escribir)" },
]
