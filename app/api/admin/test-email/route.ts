import { NextRequest, NextResponse } from 'next/server'
import { requireAdminAuth } from '@/lib/auth'
import { sendSubmissionEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  try {
    await sendSubmissionEmail({
      reference_no: 'CSERI-TEST-00000',
      full_name: 'Test User',
      email: 'test@example.com',
      phone: '071 000 0000',
      organisation: 'Test Organisation',
      role: 'community_member',
      challenge_title: 'Test notification — system check',
      challenge_description: 'This is a test notification sent from the CSERI admin dashboard to verify the email system is working correctly.',
      category: 'other',
      province: 'kzn',
      urgency: 'low',
      suits_intl_students: false,
    })
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Test email failed:', err)
    return NextResponse.json({ error: 'Failed to send test email' }, { status: 500 })
  }
}
