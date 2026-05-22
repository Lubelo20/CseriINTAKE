import { createServerSupabaseClient } from '@/lib/supabase'

describe('createServerSupabaseClient', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    process.env = {
      ...OLD_ENV,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'service-role-key',
    }
  })

  afterEach(() => {
    process.env = OLD_ENV
  })

  it('returns a supabase client without throwing', () => {
    expect(() => createServerSupabaseClient()).not.toThrow()
  })
})
