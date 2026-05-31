/**
 * TEMP BENCHMARK — scripts/bench/sql-audit.ts  (borrar tras análisis)
 *
 * Captura el SQL crudo que Prisma emite por cada operación lógica de las
 * pantallas lentas. Cuenta statements (round-trips), detecta N+1 (varios
 * SELECT sobre la misma tabla) y over-fetching.
 */
import { PrismaClient } from "@prisma/client"

type QEvent = { query: string; duration: number }
let buffer: QEvent[] = []

const prisma = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL! } },
  log: [{ emit: "event", level: "query" }],
})
// @ts-expect-error runtime event
prisma.$on("query", (e: { query: string; duration: number }) => {
  buffer.push({ query: e.query, duration: e.duration })
})

function report(label: string) {
  const stmts = buffer
  const selects = stmts.filter((s) => /^SELECT/i.test(s.query.trim()))
  // Detección naive de N+1: misma tabla raíz consultada más de una vez
  const tables = selects
    .map((s) => s.query.match(/FROM\s+"?\w+"?\.?"?(\w+)"?/i)?.[1])
    .filter(Boolean) as string[]
  const counts: Record<string, number> = {}
  for (const t of tables) counts[t] = (counts[t] ?? 0) + 1
  const n1 = Object.entries(counts).filter(([, c]) => c > 1)

  console.log(`\n### ${label}`)
  console.log(`   statements totales (round-trips): ${stmts.length}`)
  console.log(`   SELECTs reales: ${selects.length}`)
  console.log(`   wrapper (BEGIN/DEALLOCATE/COMMIT): ${stmts.length - selects.length}`)
  console.log(`   N+1: ${n1.length ? n1.map(([t, c]) => `${t}×${c}`).join(", ") : "NO"}`)
  for (const s of selects) {
    const oneLine = s.query.replace(/\s+/g, " ").trim()
    console.log(`   SQL: ${oneLine.slice(0, 180)}${oneLine.length > 180 ? "…" : ""}`)
  }
}

async function cap(label: string, fn: () => Promise<unknown>) {
  buffer = []
  await fn()
  report(label)
}

async function main() {
  const dp = await prisma.doctor_patients.findFirst({ orderBy: { shared_at: "desc" } })
  const doctorId = dp!.doctor_id
  const patientId = dp!.patient_id
  const hist = await prisma.medical_histories.findFirst({ where: { doctor_id: doctorId } })
  const historyId = hist?.id

  const thirty = new Date()
  thirty.setDate(thirty.getDate() - 30)

  await cap("dashboard: recent patients (nested include)", () =>
    prisma.doctor_patients.findMany({
      relationLoadStrategy: "join",
      where: { doctor_id: doctorId },
      include: {
        patients: {
          include: {
            medical_histories: {
              where: { doctor_id: doctorId },
              orderBy: { created_at: "desc" },
              take: 1,
              include: { treatment_items: { orderBy: { item_number: "asc" }, take: 1 } },
            },
          },
        },
      },
      orderBy: { shared_at: "desc" },
      take: 4,
    })
  )

  await cap("patients list: findMany (nested include)", () =>
    prisma.patients.findMany({
      relationLoadStrategy: "join",
      where: { doctor_patients: { some: { doctor_id: doctorId } } },
      include: {
        medical_histories: {
          orderBy: { created_at: "desc" },
          take: 1,
          include: {
            clinics: true,
            treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
          },
        },
        doctor_patients: { where: { doctor_id: doctorId } },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    })
  )

  await cap("patient detail: patient + nested histories", () =>
    prisma.patients.findUnique({
      relationLoadStrategy: "join",
      where: { id: patientId },
      include: {
        medical_histories: {
          orderBy: { created_at: "desc" },
          take: 5,
          include: {
            clinics: true,
            treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
            medical_backgrounds: { select: { immun_drug_allergy: true, blood_easy_bleeding: true } },
          },
        },
      },
    })
  )

  if (historyId) {
    await cap("history detail: full nested tree (la más pesada)", () =>
      prisma.medical_histories.findUnique({
        relationLoadStrategy: "join",
        where: { id: historyId },
        include: {
          patients: true,
          clinics: true,
          profiles: true,
          medical_backgrounds: true,
          dental_exams: { include: { tooth_records: true } },
          endodontics: { include: { endodontic_sessions: true, endodontic_canals: true } },
          treatment_items: true,
          treatment_payments: true,
        },
      })
    )
  }

  console.log("")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
