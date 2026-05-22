import type { Submission } from '@/lib/mock-data'

interface StatsCardsProps {
  submissions: Submission[]
}

export function StatsCards({ submissions }: StatsCardsProps) {
  const total = submissions.length
  const counts = {
    new: submissions.filter((s) => s.status === 'new').length,
    reviewing: submissions.filter((s) => s.status === 'reviewing').length,
    matched: submissions.filter((s) => s.status === 'matched').length,
  }

  const cards = [
    { label: 'Total', value: total, color: 'bg-cseri-navy text-white' },
    { label: 'New', value: counts.new, color: 'bg-cseri-orange text-white' },
    { label: 'Reviewing', value: counts.reviewing, color: 'bg-cseri-blue text-white' },
    { label: 'Matched', value: counts.matched, color: 'bg-green-600 text-white' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className={`rounded-xl p-4 ${color}`}>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}
