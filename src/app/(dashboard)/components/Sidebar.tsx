"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/dashboard", icon: "dashboard", label: "Inicio" },
  { href: "/patients", icon: "person", label: "Pacientes" },
  { href: "/clinics", icon: "medical_services", label: "Clínicas" },
  { href: "/settings", icon: "settings", label: "Configuración" },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
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
          <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
            Clinical Curator
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-1 px-2">
        {NAV_ITEMS.map((item) => {
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

      {/* Storage usage */}
      <div className="px-4 mt-auto">
        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
          <p className="text-xs text-slate-400 mb-2">Almacenamiento</p>
          <div className="h-1.5 w-full bg-slate-700 rounded-full overflow-hidden">
            <div className="h-full bg-sidebar-active w-[65%]" />
          </div>
          <p className="text-[10px] text-slate-500 mt-2">6.5 GB de 10 GB usados</p>
        </div>
      </div>
    </aside>
  )
}
