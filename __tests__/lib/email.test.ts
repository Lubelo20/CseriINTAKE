import { sendSubmissionEmail } from '@/lib/email'

const mockSend = jest.fn().mockResolvedValue({ id: 'email-id-123' })

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}))

const SAMPLE_PARAMS = {
  reference_no: 'CSERI-2026-00001',
  full_name: 'Sipho Dlamini',
  email: 'sipho@gmail.com',
  phone: '071 234 5678',
  organisation: '',
  role: 'community_member',
  challenge_title: 'Water access in Umlazi',
  challenge_description: 'Residents have no running water.',
  category: 'health',
  province: 'kzn',
  urgency: 'critical',
}

describe('sendSubmissionEmail', () => {
  beforeEach(() => {
    process.env.RESEND_API_KEY = 'test-key'
    process.env.RESEND_FROM_EMAIL = 'noreply@test.com'
    mockSend.mockClear()
  })

  it('resolves without throwing', async () => {
    await expect(sendSubmissionEmail(SAMPLE_PARAMS)).resolves.not.toThrow()
  })

  it('calls resend with correct subject containing reference_no', async () => {
    await sendSubmissionEmail(SAMPLE_PARAMS)
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('CSERI-2026-00001'),
        to: 'solomonn@dut.ac.za',
      }),
    )
  })
})
