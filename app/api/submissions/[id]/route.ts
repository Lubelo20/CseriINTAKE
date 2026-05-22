import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'
import { sendStatusUpdateEmail } from '@/lib/email'

const statusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'matched', 'closed']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()

  const { data: submission } = await supabase
    .from('submissions')
    .select('email, reference_no, challenge_title')
    .eq('id', id)
    .single()

  const { error } = await supabase
    .from('submissions')
    .update({ status: parsed.data.status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }

  if (submission?.email) {
    sendStatusUpdateEmail({
      to: submission.email,
      reference_no: submission.reference_no,
      challenge_title: submission.challenge_title,
      new_status: parsed.data.status,
    }).catch((err) => console.error('Status email failed:', err))
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params

  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('submissions')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
