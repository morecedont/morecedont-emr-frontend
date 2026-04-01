export type EmergencyInfo = {
  emergencyContact: string | null
}

function getInitials(name: string): string {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
}

export default function EmergencyContactCard({ patient }: { patient: EmergencyInfo }) {
  if (!patient.emergencyContact) {
    return (
      <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
        <h3 className="text-sm font-bold text-on-surface mb-3">Contacto de emergencia</h3>
        <p className="text-sm text-secondary">Sin contacto registrado</p>
      </div>
    )
  }

  const parts = patient.emergencyContact.split(" | ")
  const name = parts[0] ?? ""
  const phone = parts[1] ?? ""

  return (
    <div className="bg-white rounded-xl border border-outline-variant/10 p-5">
      <h3 className="text-sm font-bold text-on-surface mb-4">Contacto de emergencia</h3>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-sm shrink-0">
          {getInitials(name)}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-on-surface truncate">{name}</p>
          {phone && (
            <p className="text-sm text-sidebar-active flex items-center gap-1 mt-0.5">
              <span className="material-symbols-outlined text-[14px]">call</span>
              {phone}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
