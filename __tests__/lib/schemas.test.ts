import { step3Schema, step4Schema } from '@/lib/schemas'

describe('step3Schema', () => {
  it('requires full_name', () => {
    const result = step3Schema.safeParse({ full_name: '', email: '', phone: '', organisation: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('full_name')
  })

  it('passes with only full_name', () => {
    const result = step3Schema.safeParse({ full_name: 'Jane Dube', email: '', phone: '', organisation: '' })
    expect(result.success).toBe(true)
  })

  it('rejects invalid email', () => {
    const result = step3Schema.safeParse({ full_name: 'Jane', email: 'notanemail', phone: '', organisation: '' })
    expect(result.success).toBe(false)
  })
})

describe('step4Schema', () => {
  const valid = {
    challenge_title: 'Water shortage',
    challenge_description: 'No clean water in our township',
    category: 'health',
    province: 'kzn',
    urgency: 'high',
    proposed_solution: '',
    background_info: '',
    suits_intl_students: false,
  }

  it('passes with all required fields', () => {
    expect(step4Schema.safeParse(valid).success).toBe(true)
  })

  it('requires challenge_title', () => {
    const result = step4Schema.safeParse({ ...valid, challenge_title: '' })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0].path[0]).toBe('challenge_title')
  })

  it('requires challenge_description', () => {
    const result = step4Schema.safeParse({ ...valid, challenge_description: '' })
    expect(result.success).toBe(false)
  })

  it('requires valid category', () => {
    const result = step4Schema.safeParse({ ...valid, category: 'invalid' })
    expect(result.success).toBe(false)
  })
})
