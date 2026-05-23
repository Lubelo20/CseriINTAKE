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
    return (
      <div className="text-center text-gray-400 py-16 bg-white rounded-xl border border-gray-200">
        <p className="text-3xl mb-2">🔍</p>
        <p className="text-sm">No submissions match your filters</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-200">
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3 hidden sm:table-cell">Date</th>
            <th className="px-4 py-3">Submitter</th>
            <th className="px-4 py-3 hidden md:table-cell">Category</th>
            <th className="px-4 py-3 hidden lg:table-cell">Province</th>
            <th className="px-4 py-3 hidden sm:table-cell">Urgency</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="hover:bg-green-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-cseri-dark whitespace-nowrap">
                {s.reference_no}
              </td>
              <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap hidden sm:table-cell">
                {new Date(s.created_at).toLocaleDateString('en-ZA')}
              </td>
              <td className="px-4 py-3">
                <p className="text-gray-800 font-medium text-sm leading-tight">{s.full_name}</p>
                <p className="text-gray-400 text-xs mt-0.5 truncate max-w-[160px] sm:max-w-[200px]">
                  {s.challenge_title}
                </p>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <Badge variant="navy">{s.category}</Badge>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                <Badge variant="navy">{s.province.toUpperCase()}</Badge>
              </td>
              <td className="px-4 py-3 hidden sm:table-cell">
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
