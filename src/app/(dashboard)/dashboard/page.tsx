import { Suspense } from "react"
import { redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import StatsCardsServer from "./components/StatsCardsServer"
import RecentPatientsServer from "./components/RecentPatientsServer"
import ClinicalTimeline from "./components/ClinicalTimeline"

function StatsCardsSkeleton() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-surface-container-low p-5 sm:p-6 rounded-lg animate-pulse">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-xl bg-surface-container" />
            <div className="w-14 h-5 rounded-full bg-surface-container" />
          </div>
          <div className="w-32 h-4 bg-surface-container rounded mb-2" />
          <div className="w-16 h-8 bg-surface-container rounded" />
          <div className="w-24 h-3 bg-surface-container rounded mt-4" />
        </div>
      ))}
    </section>
  )
}

function RecentPatientsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between animate-pulse">
        <div className="w-40 h-5 bg-surface-container rounded" />
        <div className="w-16 h-4 bg-surface-container rounded" />
      </div>
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="hidden sm:flex px-4 lg:px-6 py-4 bg-surface-container/30 gap-8 animate-pulse">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-3 w-20 bg-surface-container rounded" />
          ))}
        </div>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="px-4 lg:px-6 py-4 border-t border-surface-container/50 flex items-center gap-4 animate-pulse"
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
    </div>
  )
}

export default async function DashboardPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 sm:space-y-8">
      <Suspense fallback={<StatsCardsSkeleton />}>
        <StatsCardsServer doctorId={profile.id} />
      </Suspense>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<RecentPatientsSkeleton />}>
            <RecentPatientsServer doctorId={profile.id} />
          </Suspense>
        </div>
        <div>
          <ClinicalTimeline />
        </div>
      </div>
    </div>
  )
}
