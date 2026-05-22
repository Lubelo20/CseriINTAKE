/**
 * @jest-environment node
 */
import { POST as loginPOST } from '@/app/api/admin/login/route'
import { POST as logoutPOST } from '@/app/api/admin/logout/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const HASH = bcrypt.hashSync('cseri2026', 10)
const JWT_SECRET = 'a-very-long-secret-key-for-testing-purposes-32ch'

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD_HASH = HASH
    process.env.JWT_SECRET = JWT_SECRET
  })

  it('returns 401 for wrong password', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'wrong' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await loginPOST(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 and sets HttpOnly cookie for correct password', async () => {
    const req = new NextRequest('http://localhost/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password: 'cseri2026' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await loginPOST(req)
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('cseri_admin_token')
    expect(setCookie).toContain('HttpOnly')
  })
})

describe('POST /api/admin/logout', () => {
  it('returns 200 and clears the cookie', async () => {
    const req = new NextRequest('http://localhost/api/admin/logout', {
      method: 'POST',
    })
    const res = await logoutPOST()
    expect(res.status).toBe(200)
  })
})
