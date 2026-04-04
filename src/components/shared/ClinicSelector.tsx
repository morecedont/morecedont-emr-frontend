"use client"

import { useState, useRef, useEffect, useCallback, useTransition } from "react"
import { searchClinics, createClinic, associateClinic } from "@/lib/actions/clinics"

export interface SelectedClinic {
  id: string
  name: string
  address?: string | null
  phone?: string | null
}

interface SearchResult {
  id: string
  name: string
  address: string | null
  phone: string | null
  isOwn: boolean
}

interface ClinicSelectorProps {
  value: SelectedClinic | null
  doctorId: string
  onChange: (clinic: SelectedClinic | null) => void
  placeholder?: string
}

const fieldCls =
  "w-full text-base bg-white border border-outline-variant/40 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"

export default function ClinicSelector({
  value,
  onChange,
  placeholder = "Buscar o crear clínica...",
}: ClinicSelectorProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createName, setCreateName] = useState("")
  const [createAddress, setCreateAddress] = useState("")
  const [createPhone, setCreatePhone] = useState("")
  const [isCreating, startCreating] = useTransition()
  const [createError, setCreateError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
        setHighlightedIndex(-1)
      }
    }
    document.addEventListener("mousedown", handleMouseDown)
    return () => document.removeEventListener("mousedown", handleMouseDown)
  }, [])

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 1) {
      setResults([])
      setShowDropdown(false)
      return
    }
    setIsSearching(true)
    try {
      const res = await searchClinics(q)
      setResults(res)
      setShowDropdown(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  function handleQueryChange(val: string) {
    setQuery(val)
    setHighlightedIndex(-1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => doSearch(val), 300)
  }

  async function handleSelectExisting(result: SearchResult) {
    if (!result.isOwn) {
      await associateClinic(result.id)
    }
    onChange({ id: result.id, name: result.name, address: result.address, phone: result.phone })
    setShowDropdown(false)
    setQuery("")
    setResults([])
  }

  function handleSelectCreate() {
    setShowCreateForm(true)
    setCreateName(query)
    setShowDropdown(false)
  }

  function handleCancelCreate() {
    setShowCreateForm(false)
    setCreateName("")
    setCreateAddress("")
    setCreatePhone("")
    setCreateError(null)
  }

  function handleCreate() {
    if (!createName.trim()) return
    setCreateError(null)
    startCreating(async () => {
      const result = await createClinic({
        name: createName,
        address: createAddress || undefined,
        phone: createPhone || undefined,
      })
      if (result.error) {
        setCreateError(result.error)
        return
      }
      if (result.warning) setWarning(result.warning)
      onChange({
        id: result.clinic!.id,
        name: result.clinic!.name,
        address: result.clinic!.address,
        phone: result.clinic!.phone,
      })
      setShowCreateForm(false)
      setCreateName("")
      setCreateAddress("")
      setCreatePhone("")
      setQuery("")
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showDropdown) return
    const totalItems = results.length + (query.trim() ? 1 : 0)
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHighlightedIndex((i) => Math.min(i + 1, totalItems - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHighlightedIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < results.length) {
        handleSelectExisting(results[highlightedIndex])
      } else if (highlightedIndex === results.length && query.trim()) {
        handleSelectCreate()
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false)
      setHighlightedIndex(-1)
      inputRef.current?.blur()
    }
  }

  // Selected pill state
  if (value) {
    return (
      <div className="space-y-2">
        <div className="bg-[#F0F4FF] border border-sidebar-active rounded-lg p-3 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2 min-w-0">
            <span className="material-symbols-outlined text-sidebar-active text-[20px] shrink-0 mt-0.5">
              local_hospital
            </span>
            <div className="min-w-0">
              <p className="font-semibold text-on-surface text-sm truncate">{value.name}</p>
              {value.address && (
                <p className="text-xs text-secondary truncate">{value.address}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onChange(null); setWarning(null) }}
            className="shrink-0 text-secondary hover:text-error transition-colors"
            aria-label="Limpiar selección"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>
        {warning && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-lg p-3">
            {warning}
          </div>
        )}
      </div>
    )
  }

  // Create form state
  if (showCreateForm) {
    return (
      <div className="bg-[#F9FAFC] border border-outline-variant/20 rounded-lg p-4 space-y-4">
        <h4 className="font-bold text-on-surface text-sm">Nueva clínica</h4>
        <div>
          <label className="block text-xs font-semibold text-secondary mb-1">
            Nombre <span className="text-error">*</span>
          </label>
          <input
            type="text"
            value={createName}
            onChange={(e) => setCreateName(e.target.value)}
            placeholder="Nombre de la clínica"
            className={fieldCls}
            autoFocus
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Dirección</label>
            <input
              type="text"
              value={createAddress}
              onChange={(e) => setCreateAddress(e.target.value)}
              placeholder="Av. Principal 123"
              className={fieldCls}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-secondary mb-1">Teléfono</label>
            <input
              type="tel"
              value={createPhone}
              onChange={(e) => setCreatePhone(e.target.value)}
              placeholder="+58 212 000-0000"
              className={fieldCls}
            />
          </div>
        </div>
        {createError && (
          <p className="text-sm text-error">{createError}</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2 sm:justify-end">
          <button
            type="button"
            onClick={handleCancelCreate}
            disabled={isCreating}
            className="h-11 px-4 text-sm font-semibold text-secondary hover:bg-surface-container rounded-lg transition-colors w-full sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreate}
            disabled={isCreating || !createName.trim()}
            className="h-11 px-4 text-sm font-bold text-white bg-sidebar-active rounded-lg hover:bg-sidebar-active/90 transition-colors disabled:opacity-60 w-full sm:w-auto"
          >
            {isCreating ? "Creando..." : "Crear clínica"}
          </button>
        </div>
      </div>
    )
  }

  // Search input state
  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px] pointer-events-none">
          search
        </span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleQueryChange(e.target.value)}
          onFocus={() => { if (query.trim().length >= 1) setShowDropdown(true) }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-11 text-base bg-white border border-outline-variant/40 rounded-lg pl-10 pr-10 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-outline/50"
        />
        {isSearching && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-outline text-[18px] animate-spin">
            progress_activity
          </span>
        )}
        {query && !isSearching && (
          <button
            type="button"
            onClick={() => { setQuery(""); setResults([]); setShowDropdown(false) }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 w-full bg-white border border-outline-variant/20 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={r.id}
              type="button"
              onClick={() => handleSelectExisting(r)}
              className={`w-full text-left px-4 py-3 flex items-start gap-3 border-b border-outline-variant/10 last:border-0 transition-colors ${
                highlightedIndex === i ? "bg-[#F0F4FF]" : "hover:bg-[#F9FAFC]"
              }`}
            >
              <span className="material-symbols-outlined text-secondary text-[18px] shrink-0 mt-0.5">
                local_hospital
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-on-surface">{r.name}</span>
                  {r.isOwn && (
                    <span className="bg-[#E6EAF5] text-sidebar-active text-[10px] font-bold rounded-full px-2 py-0.5 uppercase">
                      Tu clínica
                    </span>
                  )}
                </div>
                {r.address && (
                  <p className="text-xs text-secondary truncate">{r.address}</p>
                )}
              </div>
            </button>
          ))}

          {query.trim() && (
            <button
              type="button"
              onClick={handleSelectCreate}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 transition-colors ${
                highlightedIndex === results.length ? "bg-[#F0F4FF]" : "hover:bg-[#F9FAFC]"
              }`}
            >
              <span className="material-symbols-outlined text-sidebar-active text-[18px] shrink-0">add</span>
              <span className="text-sm text-sidebar-active font-semibold">
                Crear &ldquo;{query}&rdquo; como nueva clínica
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  )
}
