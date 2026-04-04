"use client"

const STEPS = [
  { label: "Antecedentes médicos" },
  { label: "Examen clínico" },
  { label: "Endodoncia" },
  { label: "Plan de tratamiento" },
]

interface EditProgressBarProps {
  currentStep: number // 1-based
}

export default function EditProgressBar({ currentStep }: EditProgressBarProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {/* Mobile: step counter */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <p className="text-xs font-bold text-secondary uppercase tracking-widest">
          Paso {currentStep} de {STEPS.length}
        </p>
        <p className="text-sm font-bold text-on-surface">
          {STEPS[currentStep - 1].label}
        </p>
      </div>
      <div className="w-full h-1.5 bg-outline-variant/20 rounded-full md:hidden">
        <div
          className="h-full bg-sidebar-active rounded-full transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
        />
      </div>

      {/* Desktop: full step indicator */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                    isCompleted || isCurrent
                      ? "bg-sidebar-active text-white shadow-lg shadow-blue-500/20"
                      : "bg-surface-container-highest text-on-surface-variant"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    stepNum
                  )}
                </div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-widest text-center leading-tight max-w-[80px] ${
                    isCurrent ? "text-sidebar-active" : isCompleted ? "text-sidebar-active/70" : "text-outline"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {i < STEPS.length - 1 && (
                <div className="flex-1 mx-2 h-[2px] rounded-full relative -mt-5">
                  <div className="w-full h-full bg-outline-variant/20 rounded-full" />
                  <div
                    className="absolute left-0 top-0 h-full bg-sidebar-active rounded-full transition-all duration-500"
                    style={{ width: isCompleted ? "100%" : "0%" }}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
