"use client"

import { useState } from "react"
import Sidebar from "./Sidebar"
import TopBar from "./TopBar"

interface DashboardShellProps {
  children: React.ReactNode
  doctorName: string
  doctorRole: string | null
}

export default function DashboardShell({
  children,
  doctorName,
  doctorRole,
}: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar — fixed on desktop, slide-in overlay on mobile */}
      <div
        className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      {/* Content shifted right on desktop */}
      <div className="lg:pl-64">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          doctorName={doctorName}
          doctorRole={doctorRole}
        />
        <main className="pt-16 min-h-screen">{children}</main>
      </div>
    </div>
  )
}
