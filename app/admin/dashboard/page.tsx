'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
        <div className="flex items-center gap-4">
          <span className="text-xs text-gray-300">Admin Dashboard</span>
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
