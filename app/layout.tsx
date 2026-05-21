import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CSERI Community Intake',
  description: 'Submit your community challenge to CSERI at Durban University of Technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
