import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendSubmissionEmail, sendConfirmationEmail } from '@/lib/email'
import { step3Schema, step4Schema } from '@/lib/schemas'
import { ROLES } from '@/lib/constants'

const submitSchema = z.object({
  role: z.enum(ROLES),
  contact: step3Schema,
  challenge: step4Schema,
  language_used: z.string().min(1),
  popia_consent: z.literal(true),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission data', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { role, contact, challenge, language_used } = parsed.data
  const supabase = createServerSupabaseClient()

  const { data: reference_no, error: refError } = await supabase.rpc(
    'next_submission_reference',
  )
  if (refError || !reference_no) {
    console.error('Reference generation failed:', refError)
    return NextResponse.json({ error: 'Failed to generate reference' }, { status: 500 })
  }

  const { error: insertError } = await supabase.from('submissions').insert({
    reference_no,
    role,
    full_name: contact.full_name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    organisation: contact.organisation ?? '',
    challenge_title: challenge.challenge_title,
    challenge_description: challenge.challenge_description,
    category: challenge.category,
    province: challenge.province,
    urgency: challenge.urgency,
    proposed_solution: challenge.proposed_solution ?? '',
    background_info: challenge.background_info ?? '',
    suits_intl_students: challenge.suits_intl_students,
    language_used,
    popia_consent: true,
    status: 'new',
  })

  if (insertError) {
    console.error('Insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  sendSubmissionEmail({
    reference_no,
    full_name: contact.full_name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    organisation: contact.organisation ?? '',
    role,
    challenge_title: challenge.challenge_title,
    challenge_description: challenge.challenge_description,
    category: challenge.category,
    province: challenge.province,
    urgency: challenge.urgency,
    proposed_solution: challenge.proposed_solution ?? '',
    suits_intl_students: challenge.suits_intl_students,
  }).catch((err) => console.error('Notification email failed:', err))

  if (contact.email) {
    sendConfirmationEmail({
      to: contact.email,
      reference_no,
      challenge_title: challenge.challenge_title,
    }).catch((err) => console.error('Confirmation email failed:', err))
  }

  return NextResponse.json({ reference_no })
}
