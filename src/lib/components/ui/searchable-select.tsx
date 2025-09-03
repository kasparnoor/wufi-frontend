"use client"

import React, { useMemo, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { Input } from "./input"

type Option = { value: string; label: string }

export function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Otsi…",
}: {
  options: Option[]
  value?: string
  onChange?: (v: string) => void
  placeholder?: string
  searchPlaceholder?: string
}) {
  const [query, setQuery] = useState("")
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const sorted = [...options].sort((a, b) => a.label.localeCompare(b.label, "et"))
    if (!q) return sorted
    return sorted.filter((o) => o.label.toLowerCase().includes(q))
  }, [options, query])

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full bg-white border-gray-300 rounded-lg h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="w-[28rem] max-w-[90vw] bg-white shadow-xl border border-yellow-200 rounded-xl max-h-96 overflow-auto">
        <div className="p-2 sticky top-0 bg-white z-10 border-b">
          <Input
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {filtered.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}


