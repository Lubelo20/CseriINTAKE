'use client'

import type { Submission } from '@/lib/mock-data'
import type { Filters } from './FilterBar'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red', high: 'orange', medium: 'blue', low: 'gray',
}

interface SubmissionsTableProps {
  submissions: Submission[]
  filters: Filters
  onSelect: (submission: Submission) => void
}

export function SubmissionsTable({ submissions, filters, onSelect }: SubmissionsTableProps) {
  const filtered = submissions.filter((s) => {
    if (filters.category && s.category !== filters.category) return false
    if (filters.province && s.province !== filters.province) return false
    if (filters.urgency && s.urgency !== filters.urgency) return false
    if (filters.status && s.status !== filters.status) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !s.reference_no.toLowerCase().includes(q) &&
        !s.full_name.toLowerCase().includes(q) &&
        !s.challenge_description.toLowerCase().includes(q) &&
        !s.challenge_title.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  if (filtered.length === 0) {
    return <p className="text-center text-gray-400 py-12">No submissions match your filters</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Province</th>
            <th className="px-4 py-3">Urgency</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-cseri-navy">{s.reference_no}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-800 font-medium">{s.full_name}</td>
              <td className="px-4 py-3"><Badge variant="navy">{s.category}</Badge></td>
              <td className="px-4 py-3"><Badge variant="navy">{s.province.toUpperCase()}</Badge></td>
              <td className="px-4 py-3">
                <Badge variant={URGENCY_BADGE[s.urgency] ?? 'gray'}>{s.urgency}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={s.status === 'matched' ? 'green' : s.status === 'closed' ? 'gray' : 'blue'}>
                  {s.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
