import { Resend } from 'resend'

const GREEN  = '#9ABF35'
const DARK   = '#181717'
const ORANGE = '#E38642'
const TEAL   = '#52ADC3'

function baseTemplate(body: string): string {
  return `
    <div style="font-family:Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;background:#f9fafb">
      <div style="background:${DARK};padding:18px 24px;border-bottom:4px solid ${GREEN}">
        <p style="margin:0;font-size:13px;color:#9ca3af">CSERI — Centre for Social Entrepreneurship Rapid Incubator · DUT</p>
      </div>
      ${body}
      <div style="background:#f3f4f6;padding:12px 24px;text-align:center;border-top:1px solid #e5e7eb">
        <p style="margin:0;font-size:11px;color:#9ca3af">
          Durban University of Technology · cseri-intake.vercel.app
        </p>
      </div>
    </div>
  `
}

function resend() {
  return new Resend(process.env.RESEND_API_KEY!)
}

const FROM = () => process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
const NOTIFICATION_EMAIL = () => process.env.NOTIFICATION_EMAIL ?? 'info@lubelotechsolutions.co.za'
const APP_URL = () => process.env.NEXT_PUBLIC_APP_URL ?? 'https://cseri-intake.vercel.app'

export interface NewSubmissionParams {
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
  proposed_solution?: string
  suits_intl_students?: boolean
}

export async function sendSubmissionEmail(p: NewSubmissionParams): Promise<void> {
  const urgencyColor = p.urgency === 'critical' || p.urgency === 'high' ? ORANGE : GREEN
  await resend().emails.send({
    from: FROM(),
    to: NOTIFICATION_EMAIL(),
    subject: `[CSERI] New Submission — ${p.reference_no}: ${p.challenge_title}`,
    html: baseTemplate(`
      <div style="padding:24px;background:white;border-left:4px solid ${GREEN}">
        <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em">New Community Intake Submission</p>
        <h2 style="margin:0 0 12px;font-size:20px;color:${DARK}">${p.challenge_title}</h2>
        <div style="display:inline-block;background:${DARK};color:white;padding:5px 14px;border-radius:4px;font-size:13px;font-weight:bold;letter-spacing:.05em;margin-bottom:20px">
          ${p.reference_no}
        </div>

        <table style="width:100%;border-collapse:collapse;margin-bottom:20px;font-size:13px">
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:7px 0;color:#6b7280;width:36%">Sector</td>
            <td style="padding:7px 0;color:${DARK};font-weight:600">${p.category}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:7px 0;color:#6b7280">Province</td>
            <td style="padding:7px 0;color:${DARK};font-weight:600">${p.province.toUpperCase()}</td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:7px 0;color:#6b7280">Urgency</td>
            <td style="padding:7px 0">
              <span style="background:${urgencyColor};color:white;padding:2px 10px;border-radius:3px;font-size:12px;font-weight:600">${p.urgency.toUpperCase()}</span>
            </td>
          </tr>
          <tr style="border-bottom:1px solid #f3f4f6">
            <td style="padding:7px 0;color:#6b7280">Role</td>
            <td style="padding:7px 0;color:${DARK};font-weight:600">${p.role.replace(/_/g, ' ')}</td>
          </tr>
          ${p.suits_intl_students ? `
          <tr>
            <td style="padding:7px 0;color:#6b7280">Intl Students</td>
            <td style="padding:7px 0;color:${GREEN};font-weight:600">✓ Suitable</td>
          </tr>` : ''}
        </table>

        <h3 style="margin:0 0 8px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #e5e7eb;padding-top:16px">Challenge Description</h3>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;background:#f9fafb;padding:12px;border-radius:4px">${p.challenge_description}</p>

        ${p.proposed_solution ? `
        <h3 style="margin:0 0 8px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em">Proposed Solution</h3>
        <p style="margin:0 0 16px;font-size:14px;color:#374151;line-height:1.7;background:#f9fafb;padding:12px;border-radius:4px">${p.proposed_solution}</p>
        ` : ''}

        <h3 style="margin:0 0 8px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;border-top:1px solid #e5e7eb;padding-top:16px">Contact Details (Staff Only)</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:24px">
          <tr><td style="padding:4px 0;color:#6b7280;width:36%">Name</td><td style="padding:4px 0;color:${DARK}">${p.full_name}</td></tr>
          ${p.email ? `<tr><td style="padding:4px 0;color:#6b7280">Email</td><td style="padding:4px 0"><a href="mailto:${p.email}" style="color:${GREEN};text-decoration:none">${p.email}</a></td></tr>` : ''}
          ${p.phone ? `<tr><td style="padding:4px 0;color:#6b7280">Phone</td><td style="padding:4px 0;color:${DARK}">${p.phone}</td></tr>` : ''}
          ${p.organisation ? `<tr><td style="padding:4px 0;color:#6b7280">Organisation</td><td style="padding:4px 0;color:${DARK}">${p.organisation}</td></tr>` : ''}
        </table>

        <div style="text-align:center">
          <a href="${APP_URL()}/admin/dashboard"
             style="background:${GREEN};color:white;padding:12px 28px;text-decoration:none;border-radius:4px;font-weight:bold;font-size:14px;display:inline-block">
            Open Dashboard →
          </a>
        </div>
      </div>
    `),
  })
}

export async function sendConfirmationEmail(params: {
  to: string
  reference_no: string
  challenge_title: string
}): Promise<void> {
  await resend().emails.send({
    from: FROM(),
    to: params.to,
    subject: `Your CSERI submission has been received — ${params.reference_no}`,
    html: baseTemplate(`
      <div style="padding:24px;background:white">
        <div style="text-align:center;margin-bottom:24px">
          <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;background:#f0f7e8;border-radius:50%;font-size:26px;margin-bottom:12px">✓</div>
          <h2 style="margin:0 0 8px;font-size:22px;color:${DARK}">Submission Received</h2>
          <p style="margin:0;color:#6b7280;font-size:14px">Thank you for sharing your challenge with CSERI</p>
        </div>

        <div style="background:${DARK};color:white;border-radius:8px;padding:18px;text-align:center;margin-bottom:24px">
          <p style="margin:0 0 4px;font-size:11px;color:#9ca3af;text-transform:uppercase;letter-spacing:.05em">Your Reference Number</p>
          <p style="margin:0;font-size:26px;font-weight:bold;letter-spacing:.06em">${params.reference_no}</p>
          <p style="margin:6px 0 0;font-size:11px;color:#9ca3af">Keep this safe — you may need it for follow-up</p>
        </div>

        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 16px">
          We have received your challenge: <strong>"${params.challenge_title}"</strong>.<br>
          Our team will review your submission and may reach out if we have matched it with a student research project at DUT.
        </p>

        <div style="background:#f0f7e8;border:1px solid ${GREEN};border-radius:6px;padding:16px;margin:20px 0">
          <p style="margin:0 0 8px;font-size:13px;font-weight:bold;color:${DARK}">What happens next?</p>
          <ul style="margin:0;padding-left:18px;font-size:13px;color:#374151;line-height:2">
            <li>A CSERI researcher reviews your submission</li>
            <li>Your challenge may be matched with a student project</li>
            <li>You will receive an email update when the status changes</li>
            <li>A CSERI team member may contact you for more details</li>
          </ul>
        </div>

        <p style="font-size:12px;color:#9ca3af;margin-top:20px;line-height:1.6">
          This email was sent automatically after your form submission. If you did not submit this form, please ignore it.
        </p>
      </div>
    `),
  })
}

const STATUS_INFO: Record<string, { label: string; message: string; color: string }> = {
  reviewing: {
    label: 'Under Review',
    message: 'Your submission is currently being reviewed by the CSERI team. We will be in touch if we need additional information.',
    color: TEAL,
  },
  matched: {
    label: 'Matched with a Project',
    message: 'Great news — your challenge has been matched with a student research project at DUT! A CSERI researcher will contact you soon with details on next steps.',
    color: GREEN,
  },
  closed: {
    label: 'Closed',
    message: 'Your submission has been closed. Thank you for engaging with CSERI. We encourage you to submit new challenges whenever you identify them.',
    color: '#6b7280',
  },
}

export async function sendStatusUpdateEmail(params: {
  to: string
  reference_no: string
  challenge_title: string
  new_status: string
}): Promise<void> {
  const info = STATUS_INFO[params.new_status]
  if (!info) return

  await resend().emails.send({
    from: FROM(),
    to: params.to,
    subject: `[CSERI] ${params.reference_no} — ${info.label}`,
    html: baseTemplate(`
      <div style="padding:24px;background:white">
        <div style="border-left:4px solid ${info.color};padding-left:16px;margin-bottom:20px">
          <p style="margin:0 0 4px;font-size:11px;color:#6b7280;text-transform:uppercase;letter-spacing:.08em">Status Update</p>
          <h2 style="margin:0;font-size:20px;color:${DARK}">${params.reference_no}</h2>
        </div>

        <div style="margin-bottom:20px">
          <span style="background:${info.color};color:white;padding:5px 16px;border-radius:20px;font-weight:bold;font-size:13px">
            ${info.label}
          </span>
        </div>

        <p style="font-size:14px;color:#374151;line-height:1.7;margin:0 0 12px">
          Your challenge <strong>"${params.challenge_title}"</strong> has been updated.
        </p>

        <p style="font-size:14px;color:#374151;line-height:1.7;background:#f9fafb;padding:14px;border-radius:6px;margin:0 0 20px">
          ${info.message}
        </p>

        <p style="font-size:12px;color:#9ca3af">
          Reference: ${params.reference_no} · CSERI Community Intake
        </p>
      </div>
    `),
  })
}
