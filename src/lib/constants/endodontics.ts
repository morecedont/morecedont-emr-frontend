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

// Cemento sellador (material) — distinto de la técnica de obturación.
// Selección única. El valor guardado en endodontics.sealer_cement es la
// etiqueta exacta "Familia (Marca)" (mismo criterio que irrigation_protocols).
export type SealerFamilyKey =
  | "zinc_eugenol"
  | "hidroxido_calcio"
  | "resina_epoxica"
  | "resina_metacrilato"
  | "ionomero_vidrio"
  | "silicona"
  | "bioceramico"

export type SealerCementGroup = {
  key: SealerFamilyKey
  family: string
  badgeColor: string
  brands: string[]
}

export const SEALER_CEMENT_GROUPS: SealerCementGroup[] = [
  {
    key: "zinc_eugenol",
    family: "Óxido de Zinc y Eugenol",
    badgeColor: "bg-amber-50 text-amber-700",
    brands: ["Tubli-Seal", "Pulp Canal Sealer EWT", "Endomethasone N"],
  },
  {
    key: "hidroxido_calcio",
    family: "Hidróxido de Calcio",
    badgeColor: "bg-sky-50 text-sky-700",
    brands: ["Sealapex", "Apexit Plus", "CRCS"],
  },
  {
    key: "resina_epoxica",
    family: "Resina Epóxica",
    badgeColor: "bg-indigo-50 text-indigo-700",
    brands: ["AH Plus", "AH26", "Sealer 26", "ThermaSeal"],
  },
  {
    key: "resina_metacrilato",
    family: "Resina de Metacrilato",
    badgeColor: "bg-fuchsia-50 text-fuchsia-700",
    brands: ["EndoREZ", "Epiphany"],
  },
  {
    key: "ionomero_vidrio",
    family: "Ionómero de Vidrio",
    badgeColor: "bg-lime-50 text-lime-700",
    brands: ["Ketac-Endo", "Activ GP"],
  },
  {
    key: "silicona",
    family: "Silicona",
    badgeColor: "bg-rose-50 text-rose-700",
    brands: ["RoekoSeal", "GuttaFlow"],
  },
  {
    key: "bioceramico",
    family: "Biocerámico",
    badgeColor: "bg-teal-50 text-teal-700",
    brands: [
      "Bio-C Sealer",
      "Bio-C Sealer ION+",
      "EndoSequence BC Sealer",
      "TotalFill BC Sealer",
      "MTA Fillapex",
      "AH Plus Bioceramic Sealer",
      "Well-Root ST",
    ],
  },
]

export type SealerCementOption = {
  value: string        // "Familia (Marca)" — lo que se persiste
  brand: string
  family: string
  familyKey: SealerFamilyKey
  badgeColor: string
}

export const SEALER_CEMENT_OPTIONS: SealerCementOption[] = SEALER_CEMENT_GROUPS.flatMap((g) =>
  g.brands.map((brand) => ({
    value: `${g.family} (${brand})`,
    brand,
    family: g.family,
    familyKey: g.key,
    badgeColor: g.badgeColor,
  }))
)

// Color del badge por familia, a partir del valor persistido.
export function getSealerBadgeColor(value: string | null | undefined): string {
  if (!value) return "bg-surface-container text-secondary"
  return SEALER_CEMENT_OPTIONS.find((o) => o.value === value)?.badgeColor ?? "bg-teal-50 text-teal-700"
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
