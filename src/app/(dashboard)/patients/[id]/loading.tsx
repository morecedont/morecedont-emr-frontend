export default function PatientPageLoading() {
  return (
    <div className="min-h-screen bg-surface-container-low">
      {/* Breadcrumb */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="flex items-center gap-1.5 animate-pulse">
          <div className="w-16 h-3 bg-surface-container rounded" />
          <div className="w-3 h-3 bg-surface-container rounded" />
          <div className="w-36 h-3 bg-surface-container rounded" />
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Profile header */}
        <div className="bg-white rounded-xl p-6 sm:p-8 border border-outline-variant/10 animate-pulse">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6">
            <div className="w-20 h-20 rounded-full bg-surface-container shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="w-48 h-6 bg-surface-container rounded" />
              <div className="flex flex-wrap gap-2">
                <div className="w-24 h-5 rounded-full bg-surface-container" />
                <div className="w-20 h-5 rounded-full bg-surface-container" />
                <div className="w-28 h-5 rounded-full bg-surface-container" />
              </div>
            </div>
            <div className="flex gap-2">
              <div className="w-28 h-10 bg-surface-container rounded-lg" />
              <div className="w-10 h-10 bg-surface-container rounded-lg" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* History list */}
            <div className="bg-white rounded-xl border border-outline-variant/10 overflow-hidden">
              <div className="px-6 py-5 border-b border-surface-container animate-pulse flex items-center justify-between">
                <div className="w-40 h-5 bg-surface-container rounded" />
                <div className="w-24 h-9 bg-surface-container rounded-lg" />
              </div>
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="px-6 py-5 border-b border-surface-container/50 last:border-0 flex items-center gap-4 animate-pulse"
                >
                  <div className="w-10 h-10 rounded-lg bg-surface-container shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <div className="w-40 h-4 bg-surface-container rounded" />
                    <div className="w-28 h-3 bg-surface-container rounded" />
                  </div>
                  <div className="w-16 h-5 rounded-full bg-surface-container" />
                  <div className="w-8 h-8 bg-surface-container rounded-lg" />
                </div>
              ))}
            </div>

            {/* Alerts + documents */}
            <div className="bg-white rounded-xl border border-outline-variant/10 p-5 sm:p-6 animate-pulse">
              <div className="w-36 h-5 bg-surface-container rounded mb-4" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 bg-surface-container rounded-lg" />
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar cards */}
          <div className="space-y-4">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-outline-variant/10 p-5 animate-pulse"
              >
                <div className="w-28 h-4 bg-surface-container rounded mb-4" />
                {[0, 1, 2].map((j) => (
                  <div
                    key={j}
                    className="py-2.5 border-b border-surface-container/50 last:border-0"
                  >
                    <div className="w-20 h-3 bg-surface-container rounded mb-1.5" />
                    <div className="w-32 h-3.5 bg-surface-container rounded" />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
