'use client'

import { useState } from 'react'

export function NotificationsPanel() {
  const [open, setOpen] = useState(false)
  const [sending, setSending] = useState(false)
  const [testResult, setTestResult] = useState<'idle' | 'ok' | 'error'>('idle')

  async function handleTestEmail() {
    setSending(true)
    setTestResult('idle')
    try {
      const res = await fetch('/api/admin/test-email', { method: 'POST' })
      setTestResult(res.ok ? 'ok' : 'error')
    } catch {
      setTestResult('error')
    }
    setSending(false)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <p className="text-sm font-semibold text-cseri-dark">Email Notifications</p>
          <p className="text-xs text-gray-400 mt-0.5">3 notification types active</p>
        </div>
        <span className="text-gray-400 text-xs font-medium">{open ? 'Collapse' : 'Expand'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4">
          <div className="space-y-3">
            <NotifRow
              label="New submission alerts"
              description="Sent to the CSERI team when a new intake form is submitted. Includes full contact details and challenge info."
            />
            <NotifRow
              label="Submitter confirmation"
              description="Sent automatically to the submitter (if they provided an email) confirming receipt and their reference number."
            />
            <NotifRow
              label="Status update emails"
              description="Sent to the submitter when their status changes to Reviewing, Matched, or Closed."
            />
          </div>

          <div className="border-t border-gray-100 pt-4 flex items-center gap-4">
            <div className="flex-1">
              <p className="text-xs font-medium text-gray-500">Notification recipient</p>
              <p className="text-sm text-cseri-dark font-mono mt-0.5">
                info@lubelotechsolutions.co.za
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Change via <code className="bg-gray-100 px-1 rounded">NOTIFICATION_EMAIL</code> in Vercel environment variables
              </p>
            </div>
            <div className="text-right shrink-0">
              <button
                onClick={handleTestEmail}
                disabled={sending}
                className="text-xs bg-cseri-green text-white px-4 py-2 rounded-md hover:opacity-90 disabled:opacity-50 font-medium"
              >
                {sending ? 'Sending…' : 'Send test email'}
              </button>
              {testResult === 'ok' && (
                <p className="text-xs text-green-600 mt-1">Test email sent successfully</p>
              )}
              {testResult === 'error' && (
                <p className="text-xs text-red-600 mt-1">Failed — check server logs</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function NotifRow({ label, description }: { label: string; description: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-1.5 shrink-0 w-2 h-2 rounded-full bg-cseri-green" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-cseri-dark">{label}</p>
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
            Active
          </span>
        </div>
        <p className="text-xs text-gray-500 leading-relaxed mt-0.5">{description}</p>
      </div>
    </div>
  )
}
