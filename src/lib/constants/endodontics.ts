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

// Irrigantes seleccionables en el protocolo de endodoncia (multi-select).
// El valor guardado en endodontics.irrigation_protocols es la etiqueta exacta.
export const IRRIGATION_PROTOCOLS: string[] = [
  // NaOCl
  "NaOCl 5.25%",
  "NaOCl 3%",
  "NaOCl 2.5%",
  "NaOCl 0.5%",
  // Quelantes
  "EDTA 17%",
  "Ácido cítrico 10%",
  "Ácido cítrico 25%",
  "Ácido cítrico 50%",
  // Antimicrobianos
  "CHX 2%",
  // Ozono
  "Agua ozonizada 60 µg/ml",
  "Agua ozonizada 120 µg/ml",
  "Gas de ozono 60 µg/ml",
  // Soluciones / Coadyuvantes
  "Solución fisiológica 0.9%",
  "Solución fisiológica + azul de metileno (0.9% + 0.01%)",
  // Activación
  "Láser (diodo)",
]

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
