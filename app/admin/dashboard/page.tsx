'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Submission } from '@/lib/mock-data'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { FilterBar, type Filters } from '@/components/dashboard/FilterBar'
import { SubmissionsTable } from '@/components/dashboard/SubmissionsTable'
import { SubmissionPanel } from '@/components/dashboard/SubmissionPanel'

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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-cseri-navy text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cseri-orange rounded-full flex items-center justify-center font-bold text-sm">C</div>
          <div>
            <p className="font-bold text-sm">CSERI Admin Dashboard</p>
            <p className="text-xs text-blue-200">Community Intake</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-blue-200 hover:text-white transition-colors">
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <StatsCards submissions={submissions} />
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
          />
        </>
      )}
    </div>
  )
}
