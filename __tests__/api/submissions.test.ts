/**
 * @jest-environment node
 */
import { GET } from '@/app/api/submissions/route'
import { PATCH } from '@/app/api/submissions/[id]/route'
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = 'a-very-long-secret-key-for-testing-purposes-32ch'

const MOCK_DB = {
  from: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({
      data: [{ id: '1', reference_no: 'CSERI-2026-00001', status: 'new' }],
      error: null,
    }),
    update: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ error: null }),
  })),
}

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: jest.fn(() => MOCK_DB),
}))

async function makeAuthToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET))
}

function makeRequest(
  url: string,
  token: string,
  options: { method?: string; body?: string } = {},
) {
  return new NextRequest(url, {
    method: options.method,
    body: options.body,
    headers: { Cookie: `cseri_admin_token=${token}` },
  })
}

describe('GET /api/submissions', () => {
  beforeEach(() => { process.env.JWT_SECRET = JWT_SECRET })

  it('returns 401 without auth cookie', async () => {
    const req = new NextRequest('http://localhost/api/submissions')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 with data for authenticated admin', async () => {
    const token = await makeAuthToken()
    const req = makeRequest('http://localhost/api/submissions', token)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json() as unknown[]
    expect(Array.isArray(json)).toBe(true)
  })
})

describe('PATCH /api/submissions/[id]', () => {
  beforeEach(() => { process.env.JWT_SECRET = JWT_SECRET })

  it('returns 401 without auth cookie', async () => {
    const req = new NextRequest('http://localhost/api/submissions/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'reviewing' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 200 on valid status update', async () => {
    const token = await makeAuthToken()
    const req = makeRequest('http://localhost/api/submissions/1', token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'reviewing' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(200)
  })

  it('returns 400 for invalid status', async () => {
    const token = await makeAuthToken()
    const req = makeRequest('http://localhost/api/submissions/1', token, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'invalid_status' }),
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(400)
  })
})
