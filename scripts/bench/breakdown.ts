/**
 * TEMP BENCHMARK — scripts/bench/breakdown.ts  (borrar tras análisis)
 *
 * Desglosa CADA statement que Prisma emite por operación lógica, con su
 * e.duration individual, para ver si el ~1.1s es 1 stall o N round-trips.
 * También mide latencia cruda TCP al host y compara pooler vs directo.
 */
import { PrismaClient } from "@prisma/client"
import { performance } from "node:perf_hooks"
import net from "node:net"

type QEvent = { query: string; duration: number }
let buffer: QEvent[] = []

function makeClient(url: string) {
  const c = new PrismaClient({
    datasources: { db: { url } },
    log: [{ emit: "event", level: "query" }],
  })
  // @ts-expect-error runtime event
  c.$on("query", (e: { query: string; duration: number }) => {
    buffer.push({ query: e.query, duration: e.duration })
  })
  return c
}

function tcpPing(host: string, port: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const t0 = performance.now()
    const sock = net.connect({ host, port }, () => {
      const dt = performance.now() - t0
      sock.end()
      resolve(dt)
    })
    sock.on("error", reject)
    sock.setTimeout(8000, () => {
      sock.destroy()
      reject(new Error("timeout"))
    })
  })
}

function hostPort(url: string): { host: string; port: number } {
  const m = url.match(/@([^:/]+):(\d+)/)
  return { host: m![1], port: parseInt(m![2], 10) }
}

async function main() {
  const dbUrl = process.env.DATABASE_URL!
  const directUrl = process.env.DIRECT_URL!

  // --- TCP ping crudo (sin Postgres, solo handshake TCP) ---
  const pooler = hostPort(dbUrl)
  const direct = hostPort(directUrl)
  console.log("\n--- TCP handshake (3 muestras c/u) ---")
  for (const [name, hp] of [["pooler 6543", pooler], ["direct 5432", direct]] as const) {
    const samples: number[] = []
    for (let i = 0; i < 3; i++) {
      try {
        samples.push(await tcpPing(hp.host, hp.port))
      } catch (e) {
        samples.push(NaN)
      }
    }
    console.log(`${name}: ${samples.map((s) => s.toFixed(0) + "ms").join(", ")}`)
  }

  // --- Desglose por statement vía pooler ---
  const prisma = makeClient(dbUrl)
  const dp = await prisma.doctor_patients.findFirst()
  const doctorId = dp!.doctor_id

  console.log("\n--- Statements emitidos por una operación (pooler, transaction mode) ---")
  buffer = []
  let t0 = performance.now()
  await prisma.doctor_patients.count({ where: { doctor_id: doctorId } })
  let wall = performance.now() - t0
  console.log(`count() wall=${wall.toFixed(0)}ms, ${buffer.length} statements:`)
  for (const q of buffer) {
    const short = q.query.length > 50 ? q.query.slice(0, 50) + "…" : q.query
    console.log(`   ${q.duration.toFixed(0).padStart(5)}ms  ${short}`)
  }

  // --- Round-trip puro repetido: $queryRaw SELECT 1 vía pooler ---
  console.log("\n--- SELECT 1 x10 vía POOLER (pgbouncer 6543) ---")
  const poolerSamples: number[] = []
  for (let i = 0; i < 10; i++) {
    buffer = []
    t0 = performance.now()
    await prisma.$queryRaw`SELECT 1`
    poolerSamples.push(performance.now() - t0)
  }
  poolerSamples.sort((a, b) => a - b)
  console.log(`  med=${poolerSamples[5].toFixed(0)}ms  min=${poolerSamples[0].toFixed(0)}ms  max=${poolerSamples[9].toFixed(0)}ms`)
  await prisma.$disconnect()

  // --- Round-trip puro vía conexión DIRECTA (5432) ---
  console.log("\n--- SELECT 1 x10 vía DIRECTO (5432, session mode) ---")
  const prismaDirect = makeClient(directUrl)
  const directSamples: number[] = []
  for (let i = 0; i < 10; i++) {
    buffer = []
    t0 = performance.now()
    await prismaDirect.$queryRaw`SELECT 1`
    directSamples.push(performance.now() - t0)
  }
  directSamples.sort((a, b) => a - b)
  console.log(`  med=${directSamples[5].toFixed(0)}ms  min=${directSamples[0].toFixed(0)}ms  max=${directSamples[9].toFixed(0)}ms`)
  await prismaDirect.$disconnect()

  console.log("")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
