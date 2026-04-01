const AVATAR_CLASSES = [
  "bg-primary-fixed text-on-primary-fixed",
  "bg-secondary-fixed text-on-secondary-fixed",
  "bg-tertiary-fixed text-on-tertiary-fixed",
  "bg-secondary-fixed-dim text-on-secondary-fixed",
  "bg-secondary-container text-on-secondary-container",
  "bg-primary-fixed-dim text-on-primary-fixed",
]

function getAvatarClass(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + hash * 31
  return AVATAR_CLASSES[Math.abs(hash) % AVATAR_CLASSES.length]
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

const SIZE_CLASSES = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-16 h-16 text-xl",
  xl: "w-20 h-20 text-2xl",
}

interface PatientAvatarProps {
  fullName: string
  size?: keyof typeof SIZE_CLASSES
  showStatusDot?: boolean
  isActive?: boolean
}

export default function PatientAvatar({
  fullName,
  size = "md",
  showStatusDot = false,
  isActive = false,
}: PatientAvatarProps) {
  return (
    <div className="relative shrink-0">
      <div
        className={`${SIZE_CLASSES[size]} ${getAvatarClass(fullName)} rounded-full flex items-center justify-center font-bold`}
      >
        {getInitials(fullName)}
      </div>
      {showStatusDot && (
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${
            isActive ? "bg-green-500" : "bg-gray-400"
          }`}
        />
      )}
    </div>
  )
}
