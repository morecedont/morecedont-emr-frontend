import Link from "next/link"
import { createClient } from "@/lib/supabase/server"

export const metadata = {
  title: "Solicitud rechazada — Morecedont",
}

export default async function RejectedPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  let rejectionReason: string | null = null

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("rejection_reason")
      .eq("id", user.id)
      .single()

    rejectionReason = profile?.rejection_reason ?? null
  }

  return (
    <div className="bg-background min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md text-center space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <span className="material-symbols-outlined text-primary text-[2.25rem]">
            clinical_notes
          </span>
          <span className="font-headline font-bold text-3xl tracking-tight text-on-surface">
            Morecedont
          </span>
        </div>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/20 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="w-16 h-16 bg-error-container rounded-full flex items-center justify-center mx-auto">
            <span className="material-symbols-outlined text-error text-[2rem] leading-none">
              block
            </span>
          </div>

          <div className="space-y-2">
            <h1 className="font-headline font-bold text-2xl text-on-surface">
              Solicitud rechazada
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Tu solicitud de acceso no fue aprobada.
            </p>
          </div>

          {rejectionReason && (
            <div className="bg-error-container/60 rounded-lg px-4 py-3 text-sm text-on-error-container text-left">
              <p className="font-semibold mb-1">Motivo:</p>
              <p>{rejectionReason}</p>
            </div>
          )}

          <p className="text-sm text-on-surface-variant">
            Si crees que hubo un error, contáctanos en{" "}
            <a
              href="mailto:soporte@morecedont.com"
              className="text-primary hover:underline transition-colors"
            >
              soporte@morecedont.com
            </a>
          </p>

          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full min-h-[44px] py-2.5 border-2 border-primary text-primary font-bold text-sm rounded-lg hover:bg-primary-fixed/20 active:scale-95 transition-all duration-200"
          >
            Volver al inicio de sesión
          </Link>
        </div>
      </div>
    </div>
  )
}
