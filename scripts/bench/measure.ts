/**
 * TEMP BENCHMARK SCRIPT — scripts/bench/measure.ts
 * Borrar tras el análisis. NO es código de producción.
 *
 * Objetivo (FASE A): separar el tiempo de cada pantalla en:
 *   - e.duration  = ms reales reportados por el query engine (PG + red engine↔PG)
 *   - wall        = performance.now() alrededor del await (todo: IPC Node↔engine + deserialización + PG + red)
 *   - overhead    = wall - e.duration  (IPC/ORM/deserialización + parte de red Node↔engine)
 *
 * Uso:
 *   npx ts-node --compiler-options "{\"module\":\"CommonJS\"}" scripts/bench/measure.ts
 */

import { PrismaClient } from "@prisma/client"
import { performance } from "node:perf_hooks"

// Buffer de eventos de query del engine. Capturamos e.duration por query.
type QEvent = { query: string; duration: number }
let buffer: QEvent[] = []

function makeClient(url: string) {
  const client = new PrismaClient({
    datasources: { db: { url } },
    log: [{ emit: "event", level: "query" }],
  })
  // @ts-expect-error — el tipo del event 'query' existe en runtime
  client.$on("query", (e: { query: string; duration: number }) => {
    buffer.push({ query: e.query, duration: e.duration })
  })
  return client
}

interface Stat {
  label: string
  wall: number // ms wall-clock alrededor del await
  pgSum: number // suma de e.duration de las queries disparadas
  queryCount: number
}

async function timed<T>(label: string, fn: () => Promise<T>): Promise<Stat & { result: T }> {
  buffer = [] // limpiar antes
  const t0 = performance.now()
  const result = await fn()
  const wall = performance.now() - t0
  const pgSum = buffer.reduce((s, q) => s + q.duration, 0)
  return { label, wall, pgSum, queryCount: buffer.length, result }
}

function fmt(n: number) {
  return n.toFixed(1).padStart(8)
}

async function runScreen(
  prisma: PrismaClient,
  label: string,
  fn: () => Promise<unknown>,
  iterations = 8
): Promise<{ label: string; wallMed: number; pgMed: number; wallP95: number; qCount: number }> {
  // warmup
  await timed(label, fn)
  const walls: number[] = []
  const pgs: number[] = []
  let qCount = 0
  for (let i = 0; i < iterations; i++) {
    const s = await timed(label, fn)
    walls.push(s.wall)
    pgs.push(s.pgSum)
    qCount = s.queryCount
  }
  walls.sort((a, b) => a - b)
  pgs.sort((a, b) => a - b)
  const med = (arr: number[]) => arr[Math.floor(arr.length / 2)]
  const p95 = (arr: number[]) => arr[Math.min(arr.length - 1, Math.floor(arr.length * 0.95))]
  return { label, wallMed: med(walls), pgMed: med(pgs), wallP95: p95(walls), qCount }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL!
  const prisma = makeClient(dbUrl)

  // --- Descubrir IDs reales ---
  const dp = await prisma.doctor_patients.findFirst({
    orderBy: { shared_at: "desc" },
  })
  if (!dp) {
    console.log("No hay doctor_patients en la DB. Abortando.")
    await prisma.$disconnect()
    return
  }
  const doctorId = dp.doctor_id
  const patientId = dp.patient_id

  const history = await prisma.medical_histories.findFirst({
    where: { doctor_id: doctorId },
    orderBy: { created_at: "desc" },
  })
  const historyId = history?.id

  console.log(`\nDoctor: ${doctorId}`)
  console.log(`Patient: ${patientId}`)
  console.log(`History: ${historyId ?? "(ninguna)"}\n`)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const PAGE_SIZE = 10
  const HISTORY_PAGE_SIZE = 5

  const results: Awaited<ReturnType<typeof runScreen>>[] = []

  // --- Baseline: SELECT 1 (round-trip mínimo) ---
  results.push(
    await runScreen(prisma, "BASELINE SELECT 1", () => prisma.$queryRaw`SELECT 1`)
  )

  // --- DASHBOARD ---
  results.push(
    await runScreen(prisma, "dashboard: count doctor_patients", () =>
      prisma.doctor_patients.count({ where: { doctor_id: doctorId } })
    )
  )
  results.push(
    await runScreen(prisma, "dashboard: count medical_histories 30d", () =>
      prisma.medical_histories.count({
        where: { doctor_id: doctorId, created_at: { gte: thirtyDaysAgo } },
      })
    )
  )
  results.push(
    await runScreen(prisma, "dashboard: recent patients (nested)", () =>
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
  )

  // --- LISTA DE PACIENTES ---
  const where = { doctor_patients: { some: { doctor_id: doctorId } } }
  results.push(
    await runScreen(prisma, "patients: findMany (nested)", () =>
      prisma.patients.findMany({
        relationLoadStrategy: "join",
        where,
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
        skip: 0,
        take: PAGE_SIZE,
      })
    )
  )
  results.push(
    await runScreen(prisma, "patients: count", () => prisma.patients.count({ where }))
  )
  results.push(
    await runScreen(prisma, "patients: doctor_clinics", () =>
      prisma.doctor_clinics.findMany({ where: { doctor_id: doctorId }, include: { clinics: true } })
    )
  )

  // --- DETALLE DE PACIENTE ---
  results.push(
    await runScreen(prisma, "detail: access check", () =>
      prisma.doctor_patients.findUnique({
        where: { doctor_id_patient_id: { doctor_id: doctorId, patient_id: patientId } },
      })
    )
  )
  results.push(
    await runScreen(prisma, "detail: patient (nested histories)", () =>
      prisma.patients.findUnique({
        relationLoadStrategy: "join",
        where: { id: patientId },
        include: {
          medical_histories: {
            orderBy: { created_at: "desc" },
            skip: 0,
            take: HISTORY_PAGE_SIZE,
            include: {
              clinics: true,
              treatment_items: { orderBy: { item_number: "asc" }, take: 1 },
              medical_backgrounds: {
                select: { immun_drug_allergy: true, blood_easy_bleeding: true },
              },
            },
          },
        },
      })
    )
  )
  results.push(
    await runScreen(prisma, "detail: attachments (3)", () =>
      prisma.attachments.findMany({
        relationLoadStrategy: "join",
        where: { medical_histories: { patient_id: patientId, doctor_id: doctorId } },
        include: {
          medical_histories: {
            select: { id: true, created_at: true, clinics: { select: { name: true } } },
          },
        },
        orderBy: { uploaded_at: "desc" },
        take: 3,
      })
    )
  )

  // --- HISTORIA CLÍNICA (la query más pesada) ---
  if (historyId) {
    results.push(
      await runScreen(prisma, "history: full nested tree", () =>
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
    )
  }

  // --- Reporte ---
  console.log("=".repeat(86))
  console.log(
    "QUERY".padEnd(42) +
      "wall(med)".padStart(11) +
      "PG(med)".padStart(10) +
      "wall(p95)".padStart(11) +
      "  q#"
  )
  console.log("-".repeat(86))
  for (const r of results) {
    console.log(
      r.label.padEnd(42) +
        fmt(r.wallMed) +
        " " +
        fmt(r.pgMed) +
        " " +
        fmt(r.wallP95) +
        "   " +
        r.qCount
    )
  }
  console.log("=".repeat(86))
  console.log("wall = ms alrededor del await | PG = suma e.duration (engine→PG) | overhead = wall - PG\n")

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
