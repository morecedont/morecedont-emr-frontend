"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS: {
  href: string
  icon: string
  label: string
  hidden?: boolean
  adminOnly?: boolean
}[] = [
  { href: "/dashboard", icon: "dashboard", label: "Inicio" },
  { href: "/agenda", icon: "calendar_month", label: "Agenda" },
  { href: "/patients", icon: "person", label: "Pacientes" },
  { href: "/solicitudes", icon: "person_check", label: "Solicitudes", adminOnly: true },
  { href: "/clinics", icon: "medical_services", label: "Clínicas", hidden: true },
  { href: "/settings", icon: "settings", label: "Configuración", hidden: true },
]

interface SidebarProps {
  onClose?: () => void
  isAdmin: boolean
}

export default function Sidebar({ onClose, isAdmin }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="bg-sidebar h-full w-64 flex flex-col py-6">
      {/* Logo */}
      <div className="px-6 mb-10 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shrink-0">
          <span
            className="material-symbols-outlined text-white"
            style={{ fontVariationSettings: '"FILL" 1' }}
          >
            medical_services
          </span>
        </div>
        <div>
          <p className="text-xl font-headline font-bold text-white tracking-tighter leading-none">
            Morecedont
          </p>
          <p className="text-[10px] tracking-wide text-slate-400 font-bold mt-0.5">
            Sonrisas Inteligentes
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
          if (item.hidden) return null
          if (item.adminOnly && !isAdmin) return null

          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href + "/"))

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 h-11 rounded-lg text-sm font-medium tracking-tight transition-all duration-200 active:scale-95 ${
                isActive
                  ? "bg-sidebar-active text-white"
                  : "text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <span className="material-symbols-outlined text-[20px] shrink-0">
                {item.icon}
              </span>
              {item.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
