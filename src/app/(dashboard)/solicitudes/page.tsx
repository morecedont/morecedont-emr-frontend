import { notFound, redirect } from "next/navigation"
import { getProfile } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import SolicitudCard from "./components/SolicitudCard"

export default async function SolicitudesPage() {
  const profile = await getProfile()
  if (!profile) redirect("/login")
  if (profile.role !== "admin") notFound()

  const pending = await prisma.profiles.findMany({
    where: { status: "pending", role: "doctor" },
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      full_name: true,
      email: true,
      phone: true,
      license_number: true,
      specialty: true,
      created_at: true,
    },
  })

  return (
    <div className="px-4 lg:px-8 py-6 lg:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-headline font-bold text-on-surface tracking-tight">
          Solicitudes de acceso
        </h1>
        <p className="text-sm text-on-surface-variant mt-1">
          Doctores que completaron el registro y esperan activación.
        </p>
      </div>

      {/* Badge count */}
      {pending.length > 0 && (
        <div className="flex items-center gap-2 mb-6">
          <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full">
            <span className="material-symbols-outlined text-[14px]">pending</span>
            {pending.length} pendiente{pending.length !== 1 ? "s" : ""}
          </span>
        </div>
      )}

      {/* Empty state */}
      {pending.length === 0 && (
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-sm px-6 py-16 text-center">
          <span
            className="material-symbols-outlined text-[48px] text-on-surface-variant/40 mb-4 block"
            style={{ fontVariationSettings: '"FILL" 0' }}
          >
            mark_email_read
          </span>
          <p className="text-on-surface font-medium">Sin solicitudes pendientes</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Cuando un doctor se registre aparecerá aquí.
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {pending.map((doctor) => (
          <SolicitudCard
            key={doctor.id}
            id={doctor.id}
            fullName={doctor.full_name}
            email={doctor.email}
            phone={doctor.phone ?? null}
            licenseNumber={doctor.license_number ?? null}
            specialty={doctor.specialty ?? null}
            createdAt={doctor.created_at.toISOString()}
          />
        ))}
      </div>
    </div>
  )
}
