import { jwtVerify } from 'jose'
import { NextRequest, NextResponse } from 'next/server'

const JWT_COOKIE = 'cseri_admin_token'

export async function requireAdminAuth(
  request: NextRequest,
): Promise<NextResponse | null> {
  const token = request.cookies.get(JWT_COOKIE)?.value
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET!))
    return null
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
