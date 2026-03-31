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
      <div className="flex justify-between items-center px-6 md:px-8 h-20 max-w-7xl mx-auto">
        {/* Logo */}
        <div className="text-2xl font-headline font-bold tracking-tight text-brand-dark">
          Morecedont
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
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
        <div className="hidden md:flex items-center gap-4">
          {!isAuthenticated && (
            <>
              <Link
                href="/login"
                className="px-5 py-2 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all text-sm"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
              >
                Solicitar acceso
              </Link>
            </>
          )}
          {isAuthenticated && userStatus === "active" && (
            <Link
              href="/dashboard"
              className="px-5 py-2 bg-primary text-on-primary font-semibold rounded-lg hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95 text-sm"
            >
              Ir al dashboard
            </Link>
          )}
          {isAuthenticated && userStatus === "pending" && (
            <button
              disabled
              className="px-5 py-2 text-on-surface-variant border border-outline-variant font-semibold rounded-lg opacity-60 cursor-not-allowed text-sm"
            >
              Solicitud en revisión
            </button>
          )}
          {isAuthenticated && userStatus === "rejected" && (
            <Link
              href="/register/rejected"
              className="px-5 py-2 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all text-sm"
            >
              Ver estado
            </Link>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 text-on-surface"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Abrir menú"
        >
          <span className="material-symbols-outlined">
            {menuOpen ? "close" : "menu"}
          </span>
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-lowest border-t border-outline-variant/20 px-6 py-6 flex flex-col gap-2">
          <a
            href="#inicio"
            onClick={closeMenu}
            className="text-on-surface-variant hover:text-primary transition-colors font-medium py-2"
          >
            Inicio
          </a>
          <a
            href="#como-funciona"
            onClick={closeMenu}
            className="text-on-surface-variant hover:text-primary transition-colors font-medium py-2"
          >
            Cómo funciona
          </a>
          <a
            href="#para-quien"
            onClick={closeMenu}
            className="text-on-surface-variant hover:text-primary transition-colors font-medium py-2"
          >
            Para quién
          </a>
          <a
            href="#faq"
            onClick={closeMenu}
            className="text-on-surface-variant hover:text-primary transition-colors font-medium py-2"
          >
            FAQ
          </a>

          <div className="flex flex-col gap-3 pt-4 mt-2 border-t border-outline-variant/20">
            {!isAuthenticated && (
              <>
                <Link
                  href="/login"
                  onClick={closeMenu}
                  className="px-5 py-2 text-primary border border-primary font-semibold rounded-lg hover:bg-surface-container-low transition-all text-center"
                >
                  Iniciar sesión
                </Link>
                <Link
                  href="/register"
                  onClick={closeMenu}
                  className="px-5 py-2 bg-primary text-on-primary font-semibold rounded-lg text-center"
                >
                  Solicitar acceso
                </Link>
              </>
            )}
            {isAuthenticated && userStatus === "active" && (
              <Link
                href="/dashboard"
                onClick={closeMenu}
                className="px-5 py-2 bg-primary text-on-primary font-semibold rounded-lg text-center"
              >
                Ir al dashboard
              </Link>
            )}
            {isAuthenticated && userStatus === "pending" && (
              <button
                disabled
                className="px-5 py-2 text-on-surface-variant border border-outline-variant font-semibold rounded-lg opacity-60"
              >
                Solicitud en revisión
              </button>
            )}
            {isAuthenticated && userStatus === "rejected" && (
              <Link
                href="/register/rejected"
                onClick={closeMenu}
                className="px-5 py-2 text-primary border border-primary font-semibold rounded-lg text-center"
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
