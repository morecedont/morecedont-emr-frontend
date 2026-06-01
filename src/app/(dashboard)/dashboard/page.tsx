import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import RecentPatientsServer from "./components/RecentPatientsServer"
import TodayAgendaServer from "./components/TodayAgendaServer"
import BottomMetricsServer from "./components/BottomMetricsServer"

function RecentPatientsSkeleton() {
  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden animate-pulse">
      <div className="px-4 lg:px-6 py-4 border-b border-outline-variant/10 flex items-center justify-between">
        <div className="w-40 h-5 bg-surface-container rounded" />
        <div className="w-16 h-4 bg-surface-container rounded" />
      </div>
      <div className="hidden sm:flex px-4 lg:px-6 py-4 bg-surface-container/30 gap-8">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-3 w-20 bg-surface-container rounded" />
        ))}
      </div>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="px-4 lg:px-6 py-4 border-t border-surface-container/50 flex items-center gap-4"
        >
          <div className="w-8 h-8 rounded-full bg-surface-container shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="w-32 h-3.5 bg-surface-container rounded" />
            <div className="w-20 h-2.5 bg-surface-container rounded" />
          </div>
          <div className="hidden sm:block w-20 h-3 bg-surface-container rounded" />
          <div className="hidden md:block w-28 h-3 bg-surface-container rounded" />
          <div className="w-12 h-5 rounded-full bg-surface-container" />
        </div>
      ))}
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm overflow-hidden animate-pulse h-full flex flex-col">
      <div className="px-5 py-4 border-b border-outline-variant/10 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-surface-container" />
        <div className="space-y-1.5">
          <div className="w-28 h-3.5 bg-surface-container rounded" />
          <div className="w-20 h-2.5 bg-surface-container rounded" />
        </div>
      </div>
      <div className="px-5 py-4 space-y-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex gap-2.5">
            <div className="flex flex-col items-center gap-1 pt-1">
              <div className="w-10 h-3 bg-surface-container rounded" />
              <div className="w-0.5 h-8 bg-surface-container rounded-full" />
              <div className="w-10 h-3 bg-surface-container rounded" />
            </div>
            <div className="flex-1 space-y-1.5 pb-3">
              <div className="w-32 h-3.5 bg-surface-container rounded" />
              <div className="w-24 h-2.5 bg-surface-container rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 animate-pulse">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-white rounded-2xl border border-outline-variant/10 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="w-9 h-9 rounded-xl bg-surface-container" />
            <div className="w-16 h-3 bg-surface-container rounded" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-3 bg-surface-container rounded" />
            <div className="w-16 h-8 bg-surface-container rounded" />
          </div>
          <div className="space-y-2.5">
            {[0, 1, 2].map((j) => (
              <div key={j} className="space-y-1">
                <div className="flex justify-between">
                  <div className="w-28 h-2.5 bg-surface-container rounded" />
                  <div className="w-6 h-2.5 bg-surface-container rounded" />
                </div>
                <div className="h-1.5 bg-surface-container rounded-full" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      {/* Main grid: recent patients + today agenda */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:items-stretch">
        <div className="lg:col-span-2">
          <Suspense fallback={<RecentPatientsSkeleton />}>
            <RecentPatientsServer doctorId={profile.id} />
          </Suspense>
        </div>
        <div className="flex flex-col">
          <Suspense fallback={<AgendaSkeleton />}>
            <TodayAgendaServer doctorId={profile.id} />
          </Suspense>
        </div>
      </div>

      {/* Bottom metrics row */}
      <Suspense fallback={<MetricsSkeleton />}>
        <BottomMetricsServer doctorId={profile.id} />
      </Suspense>
    </div>
  )
}
