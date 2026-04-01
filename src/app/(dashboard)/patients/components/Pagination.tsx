"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback } from "react"

interface PaginationProps {
  currentPage: number
  totalPages: number
  totalCount: number
  pageSize: number
}

export default function Pagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
}: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const goToPage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set("page", String(page))
      router.push(`/patients?${params.toString()}`)
    },
    [router, searchParams]
  )

  // Build page buttons: first 3, ellipsis, last page
  const pageButtons: (number | "ellipsis")[] = []
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) pageButtons.push(i)
  } else {
    pageButtons.push(1, 2, 3)
    if (currentPage > 4) pageButtons.push("ellipsis")
    if (currentPage > 3 && currentPage < totalPages) {
      pageButtons.push(currentPage)
    }
    if (totalPages > 3) {
      if (currentPage < totalPages - 1) pageButtons.push("ellipsis")
      pageButtons.push(totalPages)
    }
  }

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  return (
    <div className="px-4 sm:px-6 py-4 border-t border-outline-variant/10 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-container-low/30">
      <p className="text-xs font-medium text-secondary order-2 sm:order-1">
        Mostrando {startItem}-{endItem} de {totalCount} pacientes
      </p>

      <div className="flex items-center gap-1 order-1 sm:order-2">
        {/* Prev */}
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página anterior"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>

        {pageButtons.map((btn, i) =>
          btn === "ellipsis" ? (
            <span key={`ellipsis-${i}`} className="px-1 text-secondary text-xs">
              ...
            </span>
          ) : (
            <button
              key={btn}
              onClick={() => goToPage(btn)}
              className={`w-8 h-8 rounded flex items-center justify-center text-xs font-bold transition-colors ${
                btn === currentPage
                  ? "bg-primary text-white"
                  : "hover:bg-surface-container text-secondary"
              }`}
            >
              {btn}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container text-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="Página siguiente"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>
    </div>
  )
}
