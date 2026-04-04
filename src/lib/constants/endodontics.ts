export const FILE_SIZES = [
  "06", "08", "010", "15", "20", "25", "30", "35", "40", "45", "50",
  "55", "60", "70", "80", "90", "100", "110", "120", "130", "140",
]

export const FILE_SIZE_OPTIONS = FILE_SIZES.map((size) => ({
  value: size,
  label: `Lima #${size}`,
}))

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
