"use client"

import { usePathname } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { useFormStatus } from "react-dom"
import { signOut } from "@/lib/actions/auth"

function LogoutSubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-error hover:bg-error/10 disabled:opacity-60 transition-colors"
    >
      <span className="material-symbols-outlined text-[18px]">logout</span>
      {pending ? "Cerrando sesión…" : "Cerrar sesión"}
    </button>
  )
}

const PAGE_TITLES: Record<string, string> = {
  "/dashboard": "Resumen",
  "/patients": "Pacientes",
  "/clinics": "Clínicas",
  "/settings": "Configuración",
}

function getPageTitle(pathname: string): string {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname]
  const match = Object.entries(PAGE_TITLES).find(([k]) =>
    pathname.startsWith(k + "/")
  )
  return match?.[1] ?? "Dashboard"
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

interface TopBarProps {
  onMenuClick: () => void
  doctorName: string
  doctorRole: string | null
}

export default function TopBar({
  onMenuClick,
  doctorName,
  doctorRole,
}: TopBarProps) {
  const pathname = usePathname()
  const title = getPageTitle(pathname)
  const initials = getInitials(doctorName)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handlePointerDown(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setMenuOpen(false)
      }
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false)
    }
    document.addEventListener("mousedown", handlePointerDown)
    document.addEventListener("keydown", handleKey)
    return () => {
      document.removeEventListener("mousedown", handlePointerDown)
      document.removeEventListener("keydown", handleKey)
    }
  }, [menuOpen])

  return (
    <header className="fixed top-0 right-0 left-0 lg:left-64 h-16 z-30 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant/20">
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-full gap-4">
        {/* Left: hamburger + title */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            className="lg:hidden flex items-center justify-center w-10 h-10 text-on-surface-variant rounded-lg hover:bg-surface-container transition-colors"
            onClick={onMenuClick}
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="font-headline font-bold text-on-surface tracking-tight text-base sm:text-lg">
            {title}
          </h2>
        </div>

        {/* Center: search — hidden on mobile */}
        <div className="relative hidden md:block flex-1 max-w-xs lg:max-w-sm">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px] pointer-events-none">
            search
          </span>
          <input
            type="text"
            placeholder="Buscar registros..."
            className="w-full bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-base focus:ring-2 focus:ring-primary/20 transition-all outline-none"
          />
        </div>

        {/* Right: icons + profile */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-secondary">
              notifications
            </span>
          </button>
          <button className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-container transition-colors">
            <span className="material-symbols-outlined text-secondary">
              help_outline
            </span>
          </button>

          <div className="hidden sm:block h-8 w-px bg-outline-variant/30 mx-1" />

          <div className="relative flex items-center gap-2 sm:gap-3" ref={menuRef}>
            <div className="hidden md:block text-right">
              <p className="text-xs font-bold text-on-surface leading-tight">
                {doctorName}
              </p>
              <p className="text-[10px] text-secondary">{doctorRole ?? "Doctor"}</p>
            </div>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="flex items-center gap-0.5 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-controls="user-account-menu"
              id="user-menu-trigger"
            >
              <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-primary-container flex items-center justify-center text-white text-sm font-bold shrink-0 ring-2 ring-primary/10">
                {initials}
              </span>
              <span className="material-symbols-outlined text-on-surface-variant text-[20px] hidden sm:block">
                {menuOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {menuOpen ? (
              <div
                id="user-account-menu"
                role="menu"
                aria-labelledby="user-menu-trigger"
                className="absolute right-0 top-full z-40 mt-2 min-w-[220px] rounded-xl border border-outline-variant/20 bg-surface-container-lowest py-1 shadow-lg"
              >
                <div className="border-b border-outline-variant/15 px-3 py-2 md:hidden">
                  <p className="text-xs font-bold text-on-surface leading-tight">
                    {doctorName}
                  </p>
                  <p className="text-[10px] text-secondary">
                    {doctorRole ?? "Doctor"}
                  </p>
                </div>
                <form action={signOut} className="px-1 pb-1 pt-1">
                  <LogoutSubmitButton />
                </form>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  )
}
