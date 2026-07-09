"use client"

const STEPS = [
  { label: "Antecedentes médicos" },
  { label: "Examen clínico" },
  { label: "Endodoncia" },
  { label: "Plan de tratamiento" },
]

interface EditProgressBarProps {
  currentStep: number // 1-based
  onStepClick: (step: number) => void
}

export default function EditProgressBar({ currentStep, onStepClick }: EditProgressBarProps) {
  return (
    <div className="mb-8 sm:mb-10">
      {/* Mobile: horizontal scrollable step pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 md:hidden">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <button
              key={stepNum}
              type="button"
              onClick={() => onStepClick(stepNum)}
              className={`h-11 flex items-center gap-2 px-4 rounded-full shrink-0 font-semibold text-sm transition-all ${
                isCurrent
                  ? "bg-sidebar-active text-white shadow-md shadow-primary/20"
                  : isCompleted
                  ? "bg-sidebar-active/15 text-sidebar-active border border-sidebar-active/30"
                  : "bg-surface-container text-secondary border border-outline-variant/30 hover:bg-surface-container-high"
              }`}
            >
              {isCompleted ? (
                <span className="material-symbols-outlined text-[14px]">check</span>
              ) : (
                <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shrink-0 bg-white/20">
                  {stepNum}
                </span>
              )}
              <span className={isCurrent ? "inline" : "hidden sm:inline"}>
                {step.label}
              </span>
            </button>
          )
        })}
      </div>

      {/* Desktop: full step indicator with clickable circles */}
      <div className="hidden md:flex items-center justify-between">
        {STEPS.map((step, i) => {
          const stepNum = i + 1
          const isCompleted = stepNum < currentStep
          const isCurrent = stepNum === currentStep

          return (
            <div key={stepNum} className="flex items-center flex-1">
              <div className="flex flex-col items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onStepClick(stepNum)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary/30 ${
                    isCompleted
                      ? "bg-sidebar-active text-white cursor-pointer hover:brightness-110 active:scale-95"
                      : isCurrent
                      ? "bg-sidebar-active text-white shadow-lg shadow-blue-500/20 cursor-default"
                      : "bg-surface-container-highest text-on-surface-variant cursor-pointer hover:bg-surface-container-high active:scale-95"
                  }`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  ) : (
                    stepNum
                  )}
                </button>
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
                    className={`absolute left-0 top-0 h-full bg-sidebar-active rounded-full transition-all duration-500 ${
                      isCompleted ? "w-full" : "w-0"
                    }`}
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
