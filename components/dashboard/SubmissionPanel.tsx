'use client'

import { useState } from 'react'
import type { Submission } from '@/lib/mock-data'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red', high: 'orange', medium: 'blue', low: 'gray',
}

const ALL_STATUSES = ['new', 'reviewing', 'matched', 'closed'] as const
type Status = (typeof ALL_STATUSES)[number]

interface SubmissionPanelProps {
  submission: Submission
  onClose: () => void
  onStatusChange?: (updated: Submission) => void
  onDelete?: (id: string) => void
}

export function SubmissionPanel({ submission, onClose, onStatusChange, onDelete }: SubmissionPanelProps) {
  const [updating, setUpdating] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    setDeleting(true)
    const res = await fetch(`/api/submissions/${submission.id}`, { method: 'DELETE' })
    if (res.ok) {
      onDelete?.(submission.id)
      onClose()
    }
    setDeleting(false)
  }

  async function handleStatusChange(status: Status) {
    if (status === submission.status || updating) return
    setUpdating(true)
    const res = await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      onStatusChange?.({ ...submission, status })
    }
    setUpdating(false)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="bg-cseri-dark text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold">{submission.reference_no}</p>
          <p className="text-xs text-gray-300">{new Date(submission.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-gray-300 text-2xl leading-none">&times;</button>
      </div>

      <div className="p-4 sm:p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="navy">{submission.category}</Badge>
          <Badge variant="navy">{submission.province.toUpperCase()}</Badge>
          <Badge variant={URGENCY_BADGE[submission.urgency] ?? 'gray'}>{submission.urgency}</Badge>
          <Badge variant={submission.status === 'matched' ? 'green' : submission.status === 'closed' ? 'gray' : 'blue'}>
            {submission.status}
          </Badge>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={s === submission.status || updating}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${s === submission.status
                    ? 'bg-cseri-dark text-white border-cseri-dark cursor-default'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-cseri-dark hover:text-cseri-dark disabled:opacity-40'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Contact Details</h3>
          <div className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-sm">
            <span className="font-medium text-gray-500">Name</span><span className="text-gray-800 break-words">{submission.full_name}</span>
            {submission.email && <><span className="font-medium text-gray-500">Email</span><a href={`mailto:${submission.email}`} className="text-cseri-teal break-all hover:underline">{submission.email}</a></>}
            {submission.phone && <><span className="font-medium text-gray-500">Phone</span><span className="text-gray-800">{submission.phone}</span></>}
            {submission.organisation && <><span className="font-medium text-gray-500">Org</span><span className="text-gray-800">{submission.organisation}</span></>}
            <span className="font-medium text-gray-500">Role</span><span className="text-gray-800 capitalize">{submission.role.replace(/_/g, ' ')}</span>
            <span className="font-medium text-gray-500">Language</span><span className="text-gray-800">{submission.language_used.toUpperCase()}</span>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Challenge</h3>
          <h4 className="font-semibold text-cseri-dark mb-1">{submission.challenge_title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{submission.challenge_description}</p>
        </div>

        {submission.proposed_solution && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Proposed Solution</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{submission.proposed_solution}</p>
          </div>
        )}

        {submission.background_info && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Background</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{submission.background_info}</p>
          </div>
        )}

        {submission.suits_intl_students && (
          <div className="bg-green-50 rounded-lg p-3 text-sm text-cseri-green">
            ✓ Suitable for international student projects
          </div>
        )}

        <div className="border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <a
            href={`/api/pdf/${submission.reference_no}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cseri-teal underline hover:text-cseri-dark"
          >
            Download PDF (POPIA compliant)
          </a>

          {confirmDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Are you sure?</span>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="text-xs bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Deleting…' : 'Yes, delete'}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-red-600 hover:text-red-800 font-medium"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
