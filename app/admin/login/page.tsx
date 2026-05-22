'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_PASSWORD = 'cseri2026'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem('cseri_admin', '1')
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-cseri-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cseri-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-xl font-bold text-cseri-navy">CSERI Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Community Intake Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cseri-blue"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full bg-cseri-navy text-white py-2.5 rounded-md font-semibold text-sm hover:bg-blue-900 transition-colors"
          >
            Sign In
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Built by Lubelo Tech Solutions
        </p>
      </div>
    </div>
  )
}
