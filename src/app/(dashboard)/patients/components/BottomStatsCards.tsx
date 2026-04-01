import { prisma } from "@/lib/prisma"

interface BottomStatsCardsProps {
  doctorId: string
  totalPatients: number
}

async function getMonthlyGrowth(doctorId: string): Promise<string> {
  const now = new Date()
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  const [thisMonth, lastMonth] = await Promise.all([
    prisma.patients.count({
      where: {
        created_by: doctorId,
        created_at: { gte: startOfThisMonth },
      },
    }),
    prisma.patients.count({
      where: {
        created_by: doctorId,
        created_at: { gte: startOfLastMonth, lt: startOfThisMonth },
      },
    }),
  ])

  if (lastMonth === 0) return thisMonth > 0 ? "+100%" : "0%"
  const pct = ((thisMonth - lastMonth) / lastMonth) * 100
  const sign = pct >= 0 ? "+" : ""
  return `${sign}${pct.toFixed(1)}%`
}

export default async function BottomStatsCards({
  doctorId,
  totalPatients,
}: BottomStatsCardsProps) {
  const MVP_CAPACITY = 500
  const growth = await getMonthlyGrowth(doctorId)
  const capacityPct = Math.min(
    Math.round((totalPatients / MVP_CAPACITY) * 100),
    100
  )
  const slotsAvailable = Math.max(MVP_CAPACITY - totalPatients, 0)

  return (
    <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
      {/* Card 1 — Monthly Growth */}
      <div className="bg-[#F0F3FF] p-6 rounded-xl border border-[#DDE1FF]">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm shrink-0">
            <span className="material-symbols-outlined text-sidebar-active">
              analytics
            </span>
          </div>
          <h3 className="font-bold text-on-surface">Crecimiento mensual</h3>
        </div>
        <p className="text-3xl font-extrabold text-sidebar-active">{growth}</p>
        <p className="text-xs text-gray-500 mt-1">Nuevos registros este mes</p>
      </div>

      {/* Card 2 — Clinic Capacity */}
      {/* TODO: connect to real capacity settings */}
      <div className="bg-[#EAEEF9] p-6 rounded-xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="font-bold text-on-surface mb-1">
            Capacidad de la clínica
          </h3>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all"
              style={{ width: `${capacityPct}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <p className="text-xs font-bold text-gray-600">
              {capacityPct}% Completo
            </p>
            <p className="text-xs text-gray-500">
              {slotsAvailable} espacios disponibles hoy
            </p>
          </div>
        </div>
        <div className="absolute -right-4 -bottom-4 opacity-5 pointer-events-none">
          <span className="material-symbols-outlined text-8xl">
            local_hospital
          </span>
        </div>
      </div>

      {/* Card 3 — Next Sync */}
      {/* TODO: connect to real backup schedule */}
      <div className="bg-[#2E3A59] p-6 rounded-xl text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold">Próxima sincronización</h3>
          <span className="material-symbols-outlined text-blue-400">sync</span>
        </div>
        <p className="text-sm opacity-80 leading-relaxed">
          Respaldo automático programado en 45 minutos.
        </p>
        <a
          href="#"
          className="mt-4 text-xs font-bold text-blue-300 hover:text-blue-200 transition-colors inline-flex items-center gap-1"
        >
          Ver programa
          <span className="material-symbols-outlined text-sm">
            arrow_forward
          </span>
        </a>
      </div>
    </div>
  )
}
