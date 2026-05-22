/**
 * @jest-environment node
 */
import { POST } from '@/app/api/submit/route'
import { NextRequest } from 'next/server'

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    rpc: jest.fn().mockResolvedValue({ data: 'CSERI-2026-00001', error: null }),
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

jest.mock('@/lib/email', () => ({
  sendSubmissionEmail: jest.fn().mockResolvedValue(undefined),
}))

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/submit', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

const VALID_BODY = {
  role: 'community_member',
  contact: {
    full_name: 'Sipho Dlamini',
    email: 'sipho@gmail.com',
    phone: '071 234 5678',
    organisation: '',
  },
  challenge: {
    challenge_title: 'Water access in Umlazi',
    challenge_description: 'Residents have no running water for 3 months.',
    category: 'health',
    province: 'kzn',
    urgency: 'critical',
    proposed_solution: '',
    background_info: '',
    suits_intl_students: false,
  },
  language_used: 'en',
  popia_consent: true,
}

describe('POST /api/submit', () => {
  it('returns 400 for empty body', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
  })

  it('returns 400 when popia_consent is false', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, popia_consent: false }))
    expect(res.status).toBe(400)
  })

  it('returns 200 with reference_no on valid submission', async () => {
    const res = await POST(makeRequest(VALID_BODY))
    expect(res.status).toBe(200)
    const json = await res.json() as { reference_no: string }
    expect(json.reference_no).toBe('CSERI-2026-00001')
  })

  it('returns 400 for invalid role', async () => {
    const res = await POST(makeRequest({ ...VALID_BODY, role: 'unknown_role' }))
    expect(res.status).toBe(400)
  })
})
