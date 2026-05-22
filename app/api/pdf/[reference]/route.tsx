import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import { SubmissionPDF } from '@/lib/pdf'
import { createServerSupabaseClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('submissions')
    .select(
      'reference_no, created_at, role, challenge_title, challenge_description, category, province, urgency, proposed_solution, background_info, suits_intl_students, language_used',
    )
    .eq('reference_no', reference)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 })
  }

  const buffer = await renderToBuffer(<SubmissionPDF submission={data} />)

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reference}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
