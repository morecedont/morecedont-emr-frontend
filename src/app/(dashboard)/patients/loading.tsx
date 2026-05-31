export default function PatientsLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 animate-pulse">
        <div className="space-y-2">
          <div className="w-28 h-7 bg-surface-container rounded" />
          <div className="w-44 h-4 bg-surface-container rounded" />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-5 animate-pulse">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 h-11 bg-surface-container rounded-lg" />
          <div className="w-full sm:w-40 h-11 bg-surface-container rounded-lg" />
          <div className="w-full sm:w-40 h-11 bg-surface-container rounded-lg" />
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden">
        <div className="hidden sm:flex px-4 sm:px-6 py-4 bg-surface-container/30 gap-6 animate-pulse">
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="h-3 w-20 bg-surface-container rounded" />
          ))}
        </div>
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="px-4 sm:px-6 py-4 border-t border-surface-container/50 flex items-center gap-4 animate-pulse"
          >
            <div className="w-9 h-9 rounded-full bg-surface-container shrink-0" />
            <div className="flex-1 space-y-1.5">
              <div className="w-36 h-3.5 bg-surface-container rounded" />
              <div className="w-24 h-2.5 bg-surface-container rounded" />
            </div>
            <div className="hidden sm:block w-24 h-3 bg-surface-container rounded" />
            <div className="hidden md:block w-32 h-3 bg-surface-container rounded" />
            <div className="w-14 h-5 rounded-full bg-surface-container" />
          </div>
        ))}
      </div>

      {/* Bottom stats */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-pulse">
        {[0, 1, 2].map((i) => (
          <div key={i} className="bg-surface-container-low rounded-xl p-4 space-y-2">
            <div className="w-24 h-3 bg-surface-container rounded" />
            <div className="w-12 h-6 bg-surface-container rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
