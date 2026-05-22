import { Resend } from 'resend'

const NOTIFICATION_EMAIL = 'solomonn@dut.ac.za'

export interface EmailParams {
  reference_no: string
  full_name: string
  email: string
  phone: string
  organisation: string
  role: string
  challenge_title: string
  challenge_description: string
  category: string
  province: string
  urgency: string
}

export async function sendSubmissionEmail(params: EmailParams): Promise<void> {
  const resend = new Resend(process.env.RESEND_API_KEY!)
  const from = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'

  await resend.emails.send({
    from,
    to: NOTIFICATION_EMAIL,
    subject: `[CSERI] New Submission: ${params.reference_no} — ${params.challenge_title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#142444;color:white;padding:20px;border-radius:8px 8px 0 0">
          <h2 style="margin:0">New Community Intake Submission</h2>
          <p style="margin:4px 0 0;color:#93c5fd;font-size:14px">${params.reference_no}</p>
        </div>
        <div style="padding:20px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px">
          <h3 style="color:#142444;border-bottom:1px solid #e5e7eb;padding-bottom:8px">Contact Details</h3>
          <p><strong>Name:</strong> ${params.full_name}</p>
          <p><strong>Email:</strong> ${params.email || 'Not provided'}</p>
          <p><strong>Phone:</strong> ${params.phone || 'Not provided'}</p>
          <p><strong>Organisation:</strong> ${params.organisation || 'N/A'}</p>
          <p><strong>Role:</strong> ${params.role.replace(/_/g, ' ')}</p>
          <h3 style="color:#142444;border-bottom:1px solid #e5e7eb;padding-bottom:8px;margin-top:20px">Challenge</h3>
          <p><strong>Title:</strong> ${params.challenge_title}</p>
          <p><strong>Category:</strong> ${params.category} | <strong>Province:</strong> ${params.province.toUpperCase()} | <strong>Urgency:</strong> ${params.urgency}</p>
          <p><strong>Description:</strong></p>
          <p style="background:white;padding:12px;border-radius:4px;border:1px solid #e5e7eb">${params.challenge_description}</p>
          <div style="margin-top:20px;text-align:center">
            <a href="https://cseri-intake.vercel.app/admin/dashboard" style="background:#F07A1A;color:white;padding:10px 24px;text-decoration:none;border-radius:4px;font-weight:bold">
              View Dashboard
            </a>
          </div>
        </div>
      </div>
    `,
  })
}
