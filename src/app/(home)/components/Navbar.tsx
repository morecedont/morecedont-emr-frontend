"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

interface NavbarProps {
  isAuthenticated: boolean
  userStatus: "active" | "pending" | "rejected" | null
}

export default function Navbar({ isAuthenticated, userStatus }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-shadow duration-300 bg-surface-container-lowest/80 backdrop-blur-xl ${
        scrolled ? "shadow-md" : ""
      }`}
    >
      <div className="flex justify-between items-center px-4 sm:px-6 lg:px-8 h-16 sm:h-20 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-xl sm:text-2xl font-headline font-bold tracking-tight text-brand-dark shrink-0">
          Morecedont
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-6 lg:gap-8">
          <a
            href="#inicio"
            className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
          >
            Cómo funciona
          </a>
          <a
            href="#para-quien"
            className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
          >
            Para quién
          </a>
          <a
            href="#faq"
            className="text-on-surface-variant hover:text-primary transition-colors font-medium text-sm"
          >
            FAQ
          </a>
        </div>

        {/* Desktop CTA buttons */}
        <div className="hidden md:flex items-center gap-3">
          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                className="inline-flex items-center justify-center h-11 px-5 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all text-sm"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center h-11 px-5 bg-primary text-on-primary font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
              >
                Solicitar acceso
              </Link>
            </>
          )}
          {isAuthenticated && userStatus === "active" && (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center h-11 px-5 bg-primary text-on-primary font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
            >
              Ir al dashboard
            </Link>
          )}
          {isAuthenticated && userStatus === "pending" && (
            <button
              disabled
              className="inline-flex items-center justify-center h-11 px-5 text-on-surface-variant border border-outline-variant font-semibold rounded-lg opacity-60 cursor-not-allowed text-sm"
            >
              Solicitud en revisión
            </button>
          )}
          {isAuthenticated && userStatus === "rejected" && (
            <Link
              href="/register/rejected"
              className="inline-flex items-center justify-center h-11 px-5 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all text-sm"
            >
              Ver estado
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex items-center justify-center w-11 h-11 text-on-surface rounded-lg hover:bg-surface-container transition-colors"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
          aria-expanded={menuOpen}
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-4 py-4 flex flex-col gap-1">
          <a
            href="#inicio"
            onClick={closeMenu}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-medium px-3 h-11 rounded-lg hover:bg-surface-container-low"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            onClick={closeMenu}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-medium px-3 h-11 rounded-lg hover:bg-surface-container-low"
          >
            Cómo funciona
          </a>
          <a
            href="#para-quien"
            onClick={closeMenu}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-medium px-3 h-11 rounded-lg hover:bg-surface-container-low"
          >
            Para quién
          </a>
          <a
            href="#faq"
            onClick={closeMenu}
            className="flex items-center text-on-surface-variant hover:text-primary transition-colors font-medium px-3 h-11 rounded-lg hover:bg-surface-container-low"
          >
            FAQ
          </a>

          <div className="flex flex-col gap-3 pt-3 mt-2 border-t border-outline-variant/20">
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="flex items-center justify-center h-11 px-5 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="flex items-center justify-center h-11 px-5 bg-primary text-on-primary font-semibold rounded-lg"
                >
                  Solicitar acceso
                </Link>
              </>
            )}
            {isAuthenticated && userStatus === "active" && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="flex items-center justify-center h-11 px-5 bg-primary text-on-primary font-semibold rounded-lg"
              >
                Ir al dashboard
              </Link>
            )}
            {isAuthenticated && userStatus === "pending" && (
              <button
                disabled
                className="flex items-center justify-center h-11 px-5 text-on-surface-variant border border-outline-variant font-semibold rounded-lg opacity-60"
              >
                Solicitud en revisión
              </button>
            )}
            {isAuthenticated && userStatus === "rejected" && (
              <Link
                href="/register/rejected"
                onClick={closeMenu}
                className="flex items-center justify-center h-11 px-5 text-primary border border-primary font-semibold rounded-lg"
              >
                Ver estado
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
