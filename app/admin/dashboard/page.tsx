'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { Submission } from '@/lib/mock-data'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { FilterBar, type Filters } from '@/components/dashboard/FilterBar'
import { SubmissionsTable } from '@/components/dashboard/SubmissionsTable'
import { SubmissionPanel } from '@/components/dashboard/SubmissionPanel'
import { NotificationsPanel } from '@/components/dashboard/NotificationsPanel'

function exportCSV(submissions: Submission[]) {
  const headers = [
    'Reference', 'Date', 'Status', 'Full Name', 'Email', 'Phone',
    'Organisation', 'Role', 'Language', 'Category', 'Province', 'Urgency',
    'Challenge Title', 'Challenge Description', 'Proposed Solution',
    'Background Info', 'Suits Intl Students',
  ]
  const rows = submissions.map((s) => [
    s.reference_no,
    new Date(s.created_at).toLocaleDateString('en-ZA'),
    s.status,
    s.full_name,
    s.email,
    s.phone,
    s.organisation,
    s.role.replace(/_/g, ' '),
    s.language_used.toUpperCase(),
    s.category,
    s.province.toUpperCase(),
    s.urgency,
    s.challenge_title,
    s.challenge_description,
    s.proposed_solution,
    s.background_info,
    s.suits_intl_students ? 'Yes' : 'No',
  ])
  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(','))
    .join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `cseri-submissions-${new Date().toISOString().split('T')[0]}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export default function DashboardPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '', category: '', province: '', urgency: '', status: '',
  })

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch('/api/submissions')
    if (res.status === 401) {
      router.replace('/admin/login')
      return
    }
    if (res.ok) {
      const data = await res.json() as Submission[]
      setSubmissions(data)
    }
  }, [router])

  useEffect(() => {
    fetchSubmissions()
    const interval = setInterval(fetchSubmissions, 15_000)
    return () => clearInterval(interval)
  }, [fetchSubmissions])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function handleStatusChange(updatedSubmission: Submission) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s))
    )
    setSelected(updatedSubmission)
  }

  function handleDelete(id: string) {
    setSubmissions((prev) => prev.filter((s) => s.id !== id))
    setSelected(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-cseri-dark text-white px-6 py-2 flex items-center justify-between border-b-4 border-cseri-green">
        <Image
          src="/logo.png"
          alt="CSERI"
          width={160}
          height={46}
          className="h-10 w-auto object-contain"
        />
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-300 hidden sm:block">Admin Dashboard</span>
          <button
            onClick={() => exportCSV(submissions)}
            disabled={submissions.length === 0}
            className="text-xs border border-white/30 text-white px-3 py-1.5 rounded-md hover:bg-white/10 transition-colors disabled:opacity-40 font-medium"
          >
            Export CSV
          </button>
          <button
            onClick={handleLogout}
            className="text-xs bg-cseri-green text-white px-3 py-1.5 rounded-md hover:opacity-90 transition-opacity font-medium"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <StatsCards submissions={submissions} />
        <NotificationsPanel />
        <FilterBar filters={filters} onChange={setFilters} />
        <SubmissionsTable
          submissions={submissions}
          filters={filters}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
          />
          <SubmissionPanel
            submission={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        </>
      )}
    </div>
  )
}
