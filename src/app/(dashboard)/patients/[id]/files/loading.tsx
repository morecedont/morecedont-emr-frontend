export default function PatientFilesLoading() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6 animate-pulse">
        <div className="w-9 h-9 bg-surface-container rounded-lg" />
        <div className="space-y-1.5">
          <div className="w-48 h-5 bg-surface-container rounded" />
          <div className="w-32 h-3 bg-surface-container rounded" />
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1 animate-pulse">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="w-20 h-9 shrink-0 bg-surface-container rounded-full" />
        ))}
      </div>

      {/* History group label */}
      <div className="mb-4 animate-pulse">
        <div className="w-40 h-4 bg-surface-container rounded" />
      </div>

      {/* File grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-pulse">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant/10 overflow-hidden"
          >
            <div className="aspect-video bg-surface-container" />
            <div className="p-3 space-y-2">
              <div className="w-full h-3.5 bg-surface-container rounded" />
              <div className="w-20 h-3 bg-surface-container rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
