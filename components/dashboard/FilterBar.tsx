'use client'

import { CATEGORIES, PROVINCES, URGENCY_LEVELS } from '@/lib/constants'

export type Filters = {
  search: string
  category: string
  province: string
  urgency: string
  status: string
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  const selectClass = 'w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cseri-teal bg-white min-h-[40px]'

  return (
    <div className="space-y-3">
      <input
        type="search"
        placeholder="Search reference, name, challenge..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-cseri-teal bg-white"
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <select value={filters.category} onChange={(e) => update('category', e.target.value)} className={selectClass}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select value={filters.province} onChange={(e) => update('province', e.target.value)} className={selectClass}>
          <option value="">All Provinces</option>
          {PROVINCES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
        </select>
        <select value={filters.urgency} onChange={(e) => update('urgency', e.target.value)} className={selectClass}>
          <option value="">All Urgencies</option>
          {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
        <select value={filters.status} onChange={(e) => update('status', e.target.value)} className={selectClass}>
          <option value="">All Statuses</option>
          {['new', 'reviewing', 'matched', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
    </div>
  )
}
