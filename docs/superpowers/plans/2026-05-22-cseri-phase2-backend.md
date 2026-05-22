# CSERI Phase 2 Backend Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire up Supabase (submissions table), a form submission API route, Resend email notifications to solomonn@dut.ac.za, branded POPIA-compliant PDF generation, proper bcryptjs + JWT HttpOnly cookie admin auth, and a live admin dashboard that reads real data with polling.

**Architecture:** Next.js App Router API routes (server-side) handle all sensitive operations using the Supabase service role key. The admin dashboard polls GET /api/submissions every 15 seconds. Admin authentication switches from sessionStorage to a signed JWT HttpOnly cookie verified in middleware. PDF generation happens server-side via @react-pdf/renderer, excluding contact details per POPIA.

**Tech Stack:** @supabase/supabase-js v2, Resend, @react-pdf/renderer v4, bcryptjs, jose (JWT), Next.js 16 App Router API routes

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `package.json` | Modify | Add new runtime dependencies |
| `next.config.ts` | Modify | Add `serverExternalPackages` for @react-pdf/renderer |
| `lib/supabase.ts` | Create | Server (service role) + anon Supabase clients |
| `lib/email.ts` | Create | Resend email notification helper |
| `lib/pdf.tsx` | Create | @react-pdf/renderer branded PDF template (no contact details) |
| `lib/form-context.tsx` | Modify | Add `submitAndAdvance`, `isSubmitting`, `submissionError` |
| `middleware.ts` | Modify | Compose JWT check for /admin with next-intl for locale routes |
| `app/api/submit/route.ts` | Create | POST: validate → save to Supabase → email → return reference_no |
| `app/api/admin/login/route.ts` | Create | POST: bcrypt.compare → SignJWT → set HttpOnly cookie |
| `app/api/admin/logout/route.ts` | Create | POST: delete cookie |
| `app/api/submissions/route.ts` | Create | GET: fetch all submissions (JWT-guarded) |
| `app/api/submissions/[id]/route.ts` | Create | PATCH: update status (JWT-guarded) |
| `app/api/pdf/[reference]/route.ts` | Create | GET: renderToBuffer → stream PDF |
| `app/admin/login/page.tsx` | Modify | Call POST /api/admin/login instead of sessionStorage |
| `app/admin/dashboard/page.tsx` | Modify | Fetch real data, poll every 15s, real logout |
| `components/form/Step4Challenge.tsx` | Modify | Call submitAndAdvance instead of nextStep |
| `components/form/Step5Confirm.tsx` | Modify | Enable PDF download button using referenceNo |
| `components/dashboard/SubmissionPanel.tsx` | Modify | Add status change buttons wired to PATCH API |
| `__tests__/api/submit.test.ts` | Create | Unit tests for submit route |
| `__tests__/api/admin-auth.test.ts` | Create | Unit tests for login/logout routes |
| `__tests__/api/submissions.test.ts` | Create | Unit tests for GET + PATCH submissions |
| `__tests__/lib/email.test.ts` | Create | Unit tests for email helper |
| `__tests__/lib/pdf.test.tsx` | Create | Smoke test for PDF component |

---

### Task 1: Install Phase 2 Dependencies

**Files:**
- Modify: `package.json` (via npm install)
- Modify: `next.config.ts`

- [ ] **Step 1: Install runtime dependencies**

```bash
cd /Users/ndumisomngomezulu/Downloads/CSERI
npm install @supabase/supabase-js resend @react-pdf/renderer bcryptjs jose
npm install -D @types/bcryptjs
```

Expected output: `added N packages` with no errors. If @react-pdf/renderer warns about peer deps with React 19, that's acceptable — it still works.

- [ ] **Step 2: Update next.config.ts to mark @react-pdf/renderer as a server-external package**

Current `next.config.ts`:
```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({
  transpilePackages: ['next-intl', 'use-intl'],
})
```

Replace with:
```typescript
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({
  transpilePackages: ['next-intl', 'use-intl'],
  serverExternalPackages: ['@react-pdf/renderer'],
})
```

- [ ] **Step 3: Verify build still starts**

```bash
npm run build 2>&1 | tail -20
```

Expected: build completes. If there are type errors from new packages, note them — they'll be resolved in subsequent tasks.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json next.config.ts
git commit -m "chore: install phase 2 deps — supabase, resend, react-pdf, bcryptjs, jose"
```

---

### Task 2: Supabase Schema (Manual SQL Step)

**Files:**
- None (SQL runs in Supabase dashboard)

This task has no automated test — it is a one-time database setup step.

- [ ] **Step 1: Create the Supabase project**

In the Supabase dashboard (https://app.supabase.com):
1. Create a new project named `cseri-intake`
2. Note your **Project URL** and **anon key** and **service_role key** from Project Settings → API

- [ ] **Step 2: Run the schema SQL**

In the Supabase dashboard → SQL Editor → New Query, paste and run:

```sql
-- Submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_no TEXT UNIQUE NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status       TEXT NOT NULL DEFAULT 'new'
                 CHECK (status IN ('new','reviewing','matched','closed')),
  role         TEXT NOT NULL
                 CHECK (role IN ('community_member','business_owner','cseri_rep')),
  full_name    TEXT NOT NULL,
  email        TEXT NOT NULL DEFAULT '',
  phone        TEXT NOT NULL DEFAULT '',
  organisation TEXT NOT NULL DEFAULT '',
  challenge_title       TEXT NOT NULL,
  challenge_description TEXT NOT NULL,
  category     TEXT NOT NULL,
  province     TEXT NOT NULL,
  urgency      TEXT NOT NULL
                 CHECK (urgency IN ('low','medium','high','critical')),
  proposed_solution TEXT NOT NULL DEFAULT '',
  background_info   TEXT NOT NULL DEFAULT '',
  suits_intl_students BOOLEAN NOT NULL DEFAULT FALSE,
  language_used TEXT NOT NULL DEFAULT 'en',
  popia_consent BOOLEAN NOT NULL DEFAULT TRUE
);

-- Sequence for human-readable reference numbers
CREATE SEQUENCE IF NOT EXISTS submission_seq START 1;

-- Function that returns the next reference string like CSERI-2026-00001
CREATE OR REPLACE FUNCTION next_submission_reference()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  seq_val BIGINT;
  year_val TEXT;
BEGIN
  seq_val  := nextval('submission_seq');
  year_val := EXTRACT(YEAR FROM NOW())::TEXT;
  RETURN 'CSERI-' || year_val || '-' || LPAD(seq_val::TEXT, 5, '0');
END;
$$;

-- Row Level Security
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS automatically; this policy lets anon SELECT for testing
-- (Contact details are server-only; the dashboard fetches via service role API route)
CREATE POLICY "service_role_full_access" ON submissions
  USING (true)
  WITH CHECK (true);
```

- [ ] **Step 3: Verify the function works**

In SQL Editor, run:
```sql
SELECT next_submission_reference();
SELECT next_submission_reference();
SELECT next_submission_reference();
```

Expected output:
```
CSERI-2026-00001
CSERI-2026-00002
CSERI-2026-00003
```

---

### Task 3: Supabase Client Library

**Files:**
- Create: `lib/supabase.ts`

- [ ] **Step 1: Write a failing test**

Create `__tests__/lib/supabase.test.ts`:
```typescript
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
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/lib/supabase.test.ts 2>&1 | tail -15
```

Expected: `Cannot find module '@/lib/supabase'`

- [ ] **Step 3: Create lib/supabase.ts**

```typescript
import { createClient } from '@supabase/supabase-js'

export function createServerSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
```

- [ ] **Step 4: Run test — expect PASS**

```bash
npm test -- __tests__/lib/supabase.test.ts 2>&1 | tail -10
```

Expected: `1 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/supabase.ts __tests__/lib/supabase.test.ts
git commit -m "feat: add Supabase server client"
```

---

### Task 4: Email Notification Helper

**Files:**
- Create: `lib/email.ts`
- Create: `__tests__/lib/email.test.ts`

- [ ] **Step 1: Write a failing test**

Create `__tests__/lib/email.test.ts`:
```typescript
import { sendSubmissionEmail } from '@/lib/email'

jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: jest.fn().mockResolvedValue({ id: 'email-id-123' }),
    },
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
  })

  it('calls resend.emails.send without throwing', async () => {
    await expect(sendSubmissionEmail(SAMPLE_PARAMS)).resolves.not.toThrow()
  })

  it('includes reference_no and challenge_title in subject', async () => {
    const { Resend } = jest.requireMock('resend')
    const mockInstance = new Resend()
    const sendSpy = mockInstance.emails.send

    await sendSubmissionEmail(SAMPLE_PARAMS)

    expect(sendSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        subject: expect.stringContaining('CSERI-2026-00001'),
      })
    )
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/lib/email.test.ts 2>&1 | tail -10
```

Expected: `Cannot find module '@/lib/email'`

- [ ] **Step 3: Create lib/email.ts**

```typescript
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
```

- [ ] **Step 4: Run tests — expect PASS**

```bash
npm test -- __tests__/lib/email.test.ts 2>&1 | tail -10
```

Expected: `2 passed`

- [ ] **Step 5: Commit**

```bash
git add lib/email.ts __tests__/lib/email.test.ts
git commit -m "feat: add Resend email notification helper"
```

---

### Task 5: Form Submission API Route

**Files:**
- Create: `app/api/submit/route.ts`
- Create: `__tests__/api/submit.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/api/submit.test.ts`:
```typescript
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
    const json = await res.json()
    expect(json.reference_no).toBe('CSERI-2026-00001')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/api/submit.test.ts 2>&1 | tail -15
```

Expected: `Cannot find module '@/app/api/submit/route'`

- [ ] **Step 3: Create the API directory**

```bash
mkdir -p /Users/ndumisomngomezulu/Downloads/CSERI/app/api/submit
```

- [ ] **Step 4: Create app/api/submit/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { sendSubmissionEmail } from '@/lib/email'
import { step3Schema, step4Schema } from '@/lib/schemas'
import { ROLES } from '@/lib/constants'

const submitSchema = z.object({
  role: z.enum(ROLES),
  contact: step3Schema,
  challenge: step4Schema,
  language_used: z.string().min(1),
  popia_consent: z.literal(true),
})

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = submitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid submission data', issues: parsed.error.issues },
      { status: 400 },
    )
  }

  const { role, contact, challenge, language_used } = parsed.data
  const supabase = createServerSupabaseClient()

  const { data: reference_no, error: refError } = await supabase.rpc(
    'next_submission_reference',
  )
  if (refError || !reference_no) {
    console.error('Reference generation failed:', refError)
    return NextResponse.json({ error: 'Failed to generate reference' }, { status: 500 })
  }

  const { error: insertError } = await supabase.from('submissions').insert({
    reference_no,
    role,
    full_name: contact.full_name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    organisation: contact.organisation ?? '',
    challenge_title: challenge.challenge_title,
    challenge_description: challenge.challenge_description,
    category: challenge.category,
    province: challenge.province,
    urgency: challenge.urgency,
    proposed_solution: challenge.proposed_solution ?? '',
    background_info: challenge.background_info ?? '',
    suits_intl_students: challenge.suits_intl_students,
    language_used,
    popia_consent: true,
    status: 'new',
  })

  if (insertError) {
    console.error('Insert failed:', insertError)
    return NextResponse.json({ error: 'Failed to save submission' }, { status: 500 })
  }

  // Fire-and-forget email — do not block the response
  sendSubmissionEmail({
    reference_no,
    full_name: contact.full_name,
    email: contact.email ?? '',
    phone: contact.phone ?? '',
    organisation: contact.organisation ?? '',
    role,
    challenge_title: challenge.challenge_title,
    challenge_description: challenge.challenge_description,
    category: challenge.category,
    province: challenge.province,
    urgency: challenge.urgency,
  }).catch((err) => console.error('Email send failed:', err))

  return NextResponse.json({ reference_no })
}
```

- [ ] **Step 5: Run tests — expect PASS**

```bash
npm test -- __tests__/api/submit.test.ts 2>&1 | tail -15
```

Expected: `3 passed`

- [ ] **Step 6: Commit**

```bash
git add app/api/submit/route.ts __tests__/api/submit.test.ts
git commit -m "feat: add POST /api/submit route — saves to Supabase, fires email"
```

---

### Task 6: Wire Form to API — FormContext + Step4 + Step5

**Files:**
- Modify: `lib/form-context.tsx`
- Modify: `components/form/Step4Challenge.tsx`
- Modify: `components/form/Step5Confirm.tsx`

- [ ] **Step 1: Update lib/form-context.tsx**

Replace the entire file with:

```typescript
'use client'

import { createContext, useContext, useState } from 'react'
import { useLocale } from 'next-intl'
import type { Role } from './constants'
import type { Step3Data, Step4Data } from './schemas'

export type FormData = {
  popia_consent: boolean
  role?: Role
  contact?: Step3Data
  challenge?: Step4Data
}

type FormContextValue = {
  currentStep: number
  formData: FormData
  nextStep: () => void
  prevStep: () => void
  setConsent: (value: boolean) => void
  setRole: (role: Role) => void
  setContact: (data: Step3Data) => void
  submitAndAdvance: (challenge: Step4Data) => Promise<void>
  referenceNo: string
  isSubmitting: boolean
  submissionError: string | null
}

const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within FormProvider')
  return ctx
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale()
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ popia_consent: false })
  const [referenceNo, setReferenceNo] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const setConsent = (value: boolean) => setFormData((d) => ({ ...d, popia_consent: value }))
  const setRole = (role: Role) => setFormData((d) => ({ ...d, role }))
  const setContact = (contact: Step3Data) => setFormData((d) => ({ ...d, contact }))

  async function submitAndAdvance(challenge: Step4Data) {
    setFormData((d) => ({ ...d, challenge }))
    setIsSubmitting(true)
    setSubmissionError(null)

    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: formData.role,
          contact: formData.contact,
          challenge,
          language_used: locale,
          popia_consent: true,
        }),
      })

      if (!res.ok) {
        const json = await res.json().catch(() => ({}))
        throw new Error((json as { error?: string }).error ?? 'Submission failed')
      }

      const json = await res.json() as { reference_no: string }
      setReferenceNo(json.reference_no)
      setCurrentStep(5)
    } catch (err) {
      setSubmissionError(err instanceof Error ? err.message : 'Submission failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <FormContext.Provider
      value={{
        currentStep, formData, nextStep, prevStep, setConsent, setRole, setContact,
        submitAndAdvance, referenceNo, isSubmitting, submissionError,
      }}
    >
      {children}
    </FormContext.Provider>
  )
}
```

- [ ] **Step 2: Update Step4Challenge.tsx — call submitAndAdvance instead of nextStep**

Read the current file first, then find the submit handler. The current `onSubmit` looks like:
```typescript
function onSubmit(data: Step4Input) {
  setChallenge(data as Step4Data)
  nextStep()
}
```

Replace it with the following changes in `components/form/Step4Challenge.tsx`:

Change the destructuring at the top of the component:
```typescript
// BEFORE
const { formData, setChallenge, nextStep, prevStep } = useFormContext()

// AFTER
const { formData, submitAndAdvance, prevStep, isSubmitting, submissionError } = useFormContext()
```

Replace the `onSubmit` function:
```typescript
// BEFORE
function onSubmit(data: Step4Input) {
  setChallenge(data as Step4Data)
  nextStep()
}

// AFTER
async function onSubmit(data: Step4Input) {
  await submitAndAdvance(data as Step4Data)
}
```

Add the error and loading display right before the navigation buttons (just before `<div className="flex gap-3">`):
```typescript
{submissionError && (
  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
    {submissionError}
  </p>
)}
```

Update the submit button to show loading state. Find the existing submit button:
```typescript
// BEFORE
<Button type="submit" variant="primary">
  {t('next')}
</Button>

// AFTER
<Button type="submit" variant="primary" disabled={isSubmitting}>
  {isSubmitting ? 'Submitting…' : t('next')}
</Button>
```

- [ ] **Step 3: Update Step5Confirm.tsx — enable PDF download**

Replace the PDF button section at the bottom of the component. Find:
```typescript
<Button variant="outline" disabled title={t('pdfNote')}>
  {t('downloadPdf')}
</Button>
```

Replace with:
```typescript
{referenceNo ? (
  <a
    href={`/api/pdf/${referenceNo}`}
    target="_blank"
    rel="noopener noreferrer"
    className="inline-flex items-center gap-2 border border-cseri-navy text-cseri-navy px-4 py-2 rounded-md text-sm font-medium hover:bg-cseri-navy hover:text-white transition-colors"
  >
    {t('downloadPdf')}
  </a>
) : (
  <Button variant="outline" disabled title={t('pdfNote')}>
    {t('downloadPdf')}
  </Button>
)}
```

- [ ] **Step 4: Run all existing tests — expect PASS**

```bash
npm test 2>&1 | tail -20
```

Expected: all tests pass. If Step4Challenge test fails due to removed `setChallenge` or `nextStep`, update the test mock to match the new interface.

- [ ] **Step 5: Commit**

```bash
git add lib/form-context.tsx components/form/Step4Challenge.tsx components/form/Step5Confirm.tsx
git commit -m "feat: wire form submission to POST /api/submit, show real reference number on step 5"
```

---

### Task 7: Admin Authentication API Routes

**Files:**
- Create: `app/api/admin/login/route.ts`
- Create: `app/api/admin/logout/route.ts`
- Create: `__tests__/api/admin-auth.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/api/admin-auth.test.ts`:
```typescript
import { POST as loginPOST } from '@/app/api/admin/login/route'
import { POST as logoutPOST } from '@/app/api/admin/logout/route'
import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'

const HASH = bcrypt.hashSync('cseri2026', 10)

describe('POST /api/admin/login', () => {
  beforeEach(() => {
    process.env.ADMIN_PASSWORD_HASH = HASH
    process.env.JWT_SECRET = 'a-very-long-secret-key-for-testing-purposes-32ch'
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

  it('returns 200 and sets cookie for correct password', async () => {
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
    const res = await logoutPOST(req)
    expect(res.status).toBe(200)
    const setCookie = res.headers.get('set-cookie')
    expect(setCookie).toContain('cseri_admin_token')
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/api/admin-auth.test.ts 2>&1 | tail -10
```

Expected: `Cannot find module '@/app/api/admin/login/route'`

- [ ] **Step 3: Create API directories**

```bash
mkdir -p /Users/ndumisomngomezulu/Downloads/CSERI/app/api/admin/login
mkdir -p /Users/ndumisomngomezulu/Downloads/CSERI/app/api/admin/logout
```

- [ ] **Step 4: Create app/api/admin/login/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { SignJWT } from 'jose'

const JWT_COOKIE = 'cseri_admin_token'
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7

export async function POST(request: NextRequest) {
  const { password } = (await request.json()) as { password: string }

  const hash = process.env.ADMIN_PASSWORD_HASH!
  const valid = await bcrypt.compare(password, hash)
  if (!valid) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
  const token = await new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const response = NextResponse.json({ ok: true })
  response.cookies.set(JWT_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SEVEN_DAYS_SECONDS,
    path: '/',
  })
  return response
}
```

- [ ] **Step 5: Create app/api/admin/logout/route.ts**

```typescript
import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.delete('cseri_admin_token')
  return response
}
```

- [ ] **Step 6: Run tests — expect PASS**

```bash
npm test -- __tests__/api/admin-auth.test.ts 2>&1 | tail -10
```

Expected: `3 passed`

- [ ] **Step 7: Commit**

```bash
git add app/api/admin/login/route.ts app/api/admin/logout/route.ts __tests__/api/admin-auth.test.ts
git commit -m "feat: add admin login/logout API routes with bcryptjs + jose JWT HttpOnly cookie"
```

---

### Task 8: Update Middleware for JWT-Protected Admin Routes

**Files:**
- Modify: `middleware.ts`

- [ ] **Step 1: Replace middleware.ts**

The current middleware only runs next-intl. Replace it to also protect `/admin/*` routes:

```typescript
import createMiddleware from 'next-intl/middleware'
import { NextRequest, NextResponse } from 'next/server'
import { jwtVerify } from 'jose'
import { locales } from './navigation'

const intlMiddleware = createMiddleware({ locales, defaultLocale: 'en' })
const JWT_COOKIE = 'cseri_admin_token'

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Protect admin pages except the login page itself
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = request.cookies.get(JWT_COOKIE)?.value
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
    try {
      await jwtVerify(
        token,
        new TextEncoder().encode(process.env.JWT_SECRET!),
      )
    } catch {
      const res = NextResponse.redirect(new URL('/admin/login', request.url))
      res.cookies.delete(JWT_COOKIE)
      return res
    }
    return NextResponse.next()
  }

  // next-intl handles locale routing for public pages
  if (!pathname.startsWith('/admin') && !pathname.startsWith('/api')) {
    return intlMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  // Match all paths except static files and _next internals
  matcher: ['/((?!_next|.*\\..*).*)'],
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npx tsc --noEmit 2>&1 | head -20
```

Expected: no errors related to middleware.ts

- [ ] **Step 3: Run all tests — expect PASS**

```bash
npm test 2>&1 | tail -15
```

Expected: all pass (middleware is not imported by existing unit tests)

- [ ] **Step 4: Commit**

```bash
git add middleware.ts
git commit -m "feat: middleware guards /admin/* with JWT cookie, composes with next-intl locale routing"
```

---

### Task 9: Update Admin Login & Dashboard Pages

**Files:**
- Modify: `app/admin/login/page.tsx`
- Modify: `app/admin/dashboard/page.tsx`

- [ ] **Step 1: Replace app/admin/login/page.tsx**

```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-cseri-navy flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cseri-orange rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-xl font-bold text-cseri-navy">CSERI Admin</h1>
          <p className="text-sm text-gray-500 mt-1">Community Intake Dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cseri-blue"
              placeholder="Enter admin password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cseri-navy text-white py-2.5 rounded-md font-semibold text-sm hover:bg-blue-900 transition-colors disabled:opacity-60"
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="text-xs text-center text-gray-400 mt-6">
          Built by Lubelo Tech Solutions
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Update app/admin/dashboard/page.tsx — remove sessionStorage dependency**

Replace the `useEffect` auth guard and the `handleLogout` function. The sessionStorage check is no longer needed (middleware handles it). Update the entire file:

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import type { Submission } from '@/lib/mock-data'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { FilterBar, type Filters } from '@/components/dashboard/FilterBar'
import { SubmissionsTable } from '@/components/dashboard/SubmissionsTable'
import { SubmissionPanel } from '@/components/dashboard/SubmissionPanel'

export default function DashboardPage() {
  const router = useRouter()
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [selected, setSelected] = useState<Submission | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '', category: '', province: '', urgency: '', status: '',
  })

  const fetchSubmissions = useCallback(async () => {
    const res = await fetch('/api/submissions')
    if (res.status === 401) {
      router.replace('/admin/login')
      return
    }
    if (res.ok) {
      const data = await res.json() as Submission[]
      setSubmissions(data)
    }
  }, [router])

  useEffect(() => {
    fetchSubmissions()
    const interval = setInterval(fetchSubmissions, 15_000)
    return () => clearInterval(interval)
  }, [fetchSubmissions])

  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' })
    router.push('/admin/login')
  }

  function handleStatusChange(updatedSubmission: Submission) {
    setSubmissions((prev) =>
      prev.map((s) => (s.id === updatedSubmission.id ? updatedSubmission : s))
    )
    setSelected(updatedSubmission)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-cseri-navy text-white px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cseri-orange rounded-full flex items-center justify-center font-bold text-sm">C</div>
          <div>
            <p className="font-bold text-sm">CSERI Admin Dashboard</p>
            <p className="text-xs text-blue-200">Community Intake</p>
          </div>
        </div>
        <button onClick={handleLogout} className="text-sm text-blue-200 hover:text-white transition-colors">
          Logout
        </button>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
        <StatsCards submissions={submissions} />
        <FilterBar filters={filters} onChange={setFilters} />
        <SubmissionsTable
          submissions={submissions}
          filters={filters}
          onSelect={setSelected}
        />
      </div>

      {selected && (
        <>
          <div
            className="fixed inset-0 bg-black/30 z-40"
            onClick={() => setSelected(null)}
          />
          <SubmissionPanel
            submission={selected}
            onClose={() => setSelected(null)}
            onStatusChange={handleStatusChange}
          />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Run all tests**

```bash
npm test 2>&1 | tail -15
```

Expected: all pass (dashboard page tests use mock data; update any that reference sessionStorage)

- [ ] **Step 4: Commit**

```bash
git add app/admin/login/page.tsx app/admin/dashboard/page.tsx
git commit -m "feat: admin login/logout uses API + JWT cookie, dashboard polls real data"
```

---

### Task 10: Submissions Read & Status Update API Routes

**Files:**
- Create: `app/api/submissions/route.ts`
- Create: `app/api/submissions/[id]/route.ts`
- Create: `__tests__/api/submissions.test.ts`

- [ ] **Step 1: Write failing tests**

Create `__tests__/api/submissions.test.ts`:
```typescript
import { GET } from '@/app/api/submissions/route'
import { PATCH } from '@/app/api/submissions/[id]/route'
import { NextRequest } from 'next/server'
import { SignJWT } from 'jose'

const JWT_SECRET = 'a-very-long-secret-key-for-testing-purposes-32ch'

jest.mock('@/lib/supabase', () => ({
  createServerSupabaseClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: [{ id: '1', reference_no: 'CSERI-2026-00001', status: 'new' }], error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    })),
  })),
}))

async function makeAuthToken() {
  return new SignJWT({ role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(JWT_SECRET))
}

function makeAuthRequest(url: string, token: string, init?: RequestInit) {
  return new NextRequest(url, {
    ...init,
    headers: {
      ...((init?.headers as Record<string, string>) ?? {}),
      Cookie: `cseri_admin_token=${token}`,
    },
  })
}

describe('GET /api/submissions', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET
  })

  it('returns 401 without auth cookie', async () => {
    const req = new NextRequest('http://localhost/api/submissions')
    const res = await GET(req)
    expect(res.status).toBe(401)
  })

  it('returns 200 with submissions for authenticated admin', async () => {
    const token = await makeAuthToken()
    const req = makeAuthRequest('http://localhost/api/submissions', token)
    const res = await GET(req)
    expect(res.status).toBe(200)
    const json = await res.json() as unknown[]
    expect(Array.isArray(json)).toBe(true)
  })
})

describe('PATCH /api/submissions/[id]', () => {
  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET
  })

  it('returns 401 without auth cookie', async () => {
    const req = new NextRequest('http://localhost/api/submissions/1', {
      method: 'PATCH',
      body: JSON.stringify({ status: 'reviewing' }),
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(401)
  })

  it('returns 200 on status update with valid token', async () => {
    const token = await makeAuthToken()
    const req = makeAuthRequest(
      'http://localhost/api/submissions/1',
      token,
      {
        method: 'PATCH',
        body: JSON.stringify({ status: 'reviewing' }),
        headers: { 'Content-Type': 'application/json' },
      },
    )
    const res = await PATCH(req, { params: Promise.resolve({ id: '1' }) })
    expect(res.status).toBe(200)
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/api/submissions.test.ts 2>&1 | tail -10
```

Expected: `Cannot find module '@/app/api/submissions/route'`

- [ ] **Step 3: Create API directories**

```bash
mkdir -p /Users/ndumisomngomezulu/Downloads/CSERI/app/api/submissions/\[id\]
```

- [ ] **Step 4: Create a shared JWT verification helper**

Create `lib/auth.ts`:
```typescript
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
    return null // null means auth passed
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
}
```

- [ ] **Step 5: Create app/api/submissions/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  return NextResponse.json(data)
}
```

- [ ] **Step 6: Create app/api/submissions/[id]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerSupabaseClient } from '@/lib/supabase'
import { requireAdminAuth } from '@/lib/auth'

const statusSchema = z.object({
  status: z.enum(['new', 'reviewing', 'matched', 'closed']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const authError = await requireAdminAuth(request)
  if (authError) return authError

  const { id } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 })
  }

  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('submissions')
    .update({ status: parsed.data.status })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Database error' }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 7: Run tests — expect PASS**

```bash
npm test -- __tests__/api/submissions.test.ts 2>&1 | tail -15
```

Expected: `4 passed`

- [ ] **Step 8: Commit**

```bash
git add lib/auth.ts app/api/submissions/route.ts "app/api/submissions/[id]/route.ts" __tests__/api/submissions.test.ts
git commit -m "feat: add GET /api/submissions and PATCH /api/submissions/[id] with JWT auth"
```

---

### Task 11: Status Update in SubmissionPanel

**Files:**
- Modify: `components/dashboard/SubmissionPanel.tsx`

- [ ] **Step 1: Update SubmissionPanel to accept `onStatusChange` prop and add status buttons**

Replace the entire file:

```typescript
'use client'

import { useState } from 'react'
import type { Submission } from '@/lib/mock-data'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red', high: 'orange', medium: 'blue', low: 'gray',
}

const ALL_STATUSES = ['new', 'reviewing', 'matched', 'closed'] as const
type Status = (typeof ALL_STATUSES)[number]

interface SubmissionPanelProps {
  submission: Submission
  onClose: () => void
  onStatusChange?: (updated: Submission) => void
}

export function SubmissionPanel({ submission, onClose, onStatusChange }: SubmissionPanelProps) {
  const [updating, setUpdating] = useState(false)

  async function handleStatusChange(status: Status) {
    if (status === submission.status || updating) return
    setUpdating(true)
    const res = await fetch(`/api/submissions/${submission.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    if (res.ok) {
      onStatusChange?.({ ...submission, status })
    }
    setUpdating(false)
  }

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-white shadow-2xl z-50 overflow-y-auto">
      <div className="bg-cseri-navy text-white px-6 py-4 flex items-center justify-between">
        <div>
          <p className="font-bold">{submission.reference_no}</p>
          <p className="text-xs text-blue-200">{new Date(submission.created_at).toLocaleDateString()}</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-blue-200 text-2xl leading-none">&times;</button>
      </div>

      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2">
          <Badge variant="navy">{submission.category}</Badge>
          <Badge variant="navy">{submission.province.toUpperCase()}</Badge>
          <Badge variant={URGENCY_BADGE[submission.urgency] ?? 'gray'}>{submission.urgency}</Badge>
          <Badge variant={submission.status === 'matched' ? 'green' : submission.status === 'closed' ? 'gray' : 'blue'}>
            {submission.status}
          </Badge>
        </div>

        {/* Status management */}
        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Update Status</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => handleStatusChange(s)}
                disabled={s === submission.status || updating}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors
                  ${s === submission.status
                    ? 'bg-cseri-navy text-white border-cseri-navy cursor-default'
                    : 'bg-white text-gray-600 border-gray-300 hover:border-cseri-navy hover:text-cseri-navy disabled:opacity-40'
                  }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Contact Details</h3>
          <div className="space-y-1 text-sm">
            <p><span className="font-medium">Name:</span> {submission.full_name}</p>
            {submission.email && <p><span className="font-medium">Email:</span> {submission.email}</p>}
            {submission.phone && <p><span className="font-medium">Phone:</span> {submission.phone}</p>}
            {submission.organisation && <p><span className="font-medium">Organisation:</span> {submission.organisation}</p>}
            <p><span className="font-medium">Role:</span> {submission.role.replace(/_/g, ' ')}</p>
            <p><span className="font-medium">Language:</span> {submission.language_used.toUpperCase()}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Challenge</h3>
          <h4 className="font-semibold text-cseri-navy mb-1">{submission.challenge_title}</h4>
          <p className="text-sm text-gray-700 leading-relaxed">{submission.challenge_description}</p>
        </div>

        {submission.proposed_solution && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Proposed Solution</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{submission.proposed_solution}</p>
          </div>
        )}

        {submission.background_info && (
          <div>
            <h3 className="text-xs font-semibold uppercase text-gray-400 mb-2">Background</h3>
            <p className="text-sm text-gray-700 leading-relaxed">{submission.background_info}</p>
          </div>
        )}

        {submission.suits_intl_students && (
          <div className="bg-blue-50 rounded-lg p-3 text-sm text-cseri-blue">
            ✓ Suitable for international student projects
          </div>
        )}

        {/* PDF link for staff */}
        <div className="border-t pt-4">
          <a
            href={`/api/pdf/${submission.reference_no}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-cseri-blue underline hover:text-cseri-navy"
          >
            Download PDF (excludes contact details)
          </a>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Run all tests**

```bash
npm test 2>&1 | tail -15
```

Expected: all pass.

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/SubmissionPanel.tsx
git commit -m "feat: SubmissionPanel adds status update buttons wired to PATCH /api/submissions/[id]"
```

---

### Task 12: PDF Generation

**Files:**
- Create: `lib/pdf.tsx`
- Create: `app/api/pdf/[reference]/route.ts`
- Create: `__tests__/lib/pdf.test.tsx`

- [ ] **Step 1: Write a failing smoke test**

Create `__tests__/lib/pdf.test.tsx`:
```typescript
import React from 'react'
import { SubmissionPDF } from '@/lib/pdf'

const SAMPLE = {
  reference_no: 'CSERI-2026-00001',
  created_at: '2026-05-22T10:00:00Z',
  role: 'community_member',
  challenge_title: 'Water access in Umlazi',
  challenge_description: 'Residents have no running water.',
  category: 'health',
  province: 'kzn',
  urgency: 'critical',
  proposed_solution: 'Emergency tanker deployment',
  background_info: '',
  suits_intl_students: true,
  language_used: 'en',
}

describe('SubmissionPDF', () => {
  it('renders without throwing', () => {
    expect(() => <SubmissionPDF submission={SAMPLE} />).not.toThrow()
  })
})
```

- [ ] **Step 2: Run test — expect FAIL**

```bash
npm test -- __tests__/lib/pdf.test.tsx 2>&1 | tail -10
```

Expected: `Cannot find module '@/lib/pdf'`

- [ ] **Step 3: Create lib/pdf.tsx**

```typescript
import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const NAVY = '#142444'
const ORANGE = '#F07A1A'

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#222' },
  headerBar: { backgroundColor: NAVY, padding: 16, borderRadius: 4, marginBottom: 16 },
  headerTitle: { color: 'white', fontSize: 16, fontFamily: 'Helvetica-Bold' },
  headerSub: { color: '#93c5fd', fontSize: 9, marginTop: 3 },
  refBox: { backgroundColor: NAVY, padding: 10, borderRadius: 4, marginBottom: 20, textAlign: 'center' },
  refText: { color: 'white', fontSize: 14, fontFamily: 'Helvetica-Bold', textAlign: 'center' },
  section: { marginBottom: 14 },
  sectionTitle: { fontSize: 8, color: '#9ca3af', textTransform: 'uppercase', marginBottom: 5, fontFamily: 'Helvetica-Bold', letterSpacing: 1 },
  label: { fontSize: 9, color: '#374151', fontFamily: 'Helvetica-Bold', marginBottom: 2 },
  value: { fontSize: 10, color: '#111827', lineHeight: 1.5, marginBottom: 8 },
  badgeRow: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  badge: { backgroundColor: ORANGE, color: 'white', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 3, fontSize: 8 },
  divider: { borderBottom: '1 solid #e5e7eb', marginVertical: 12 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, borderTop: '1 solid #e5e7eb', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#9ca3af', textAlign: 'center' },
  notice: { backgroundColor: '#fef3c7', padding: 8, borderRadius: 4, marginBottom: 14 },
  noticeText: { fontSize: 8, color: '#92400e' },
})

interface SubmissionPDFProps {
  submission: {
    reference_no: string
    created_at: string
    role: string
    challenge_title: string
    challenge_description: string
    category: string
    province: string
    urgency: string
    proposed_solution: string
    background_info: string
    suits_intl_students: boolean
    language_used: string
  }
}

export function SubmissionPDF({ submission }: SubmissionPDFProps) {
  const date = new Date(submission.created_at).toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <Document
      title={`CSERI Intake — ${submission.reference_no}`}
      author="CSERI Community Intake System"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.headerBar}>
          <Text style={styles.headerTitle}>CSERI Community Intake</Text>
          <Text style={styles.headerSub}>Centre for Social Entrepreneurship — Durban University of Technology</Text>
          <Text style={styles.headerSub}>Submitted: {date}</Text>
        </View>

        {/* Reference */}
        <View style={styles.refBox}>
          <Text style={styles.refText}>{submission.reference_no}</Text>
        </View>

        {/* POPIA notice */}
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            POPIA Notice: Contact details (name, email, phone) are not included in this document in accordance with the Protection of Personal Information Act. They are only accessible to authorised CSERI staff via the admin dashboard.
          </Text>
        </View>

        {/* Submission info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Submission Info</Text>
          <View style={styles.badgeRow}>
            <View style={styles.badge}><Text>{submission.category}</Text></View>
            <View style={styles.badge}><Text>{submission.province.toUpperCase()}</Text></View>
            <View style={styles.badge}><Text>{submission.urgency}</Text></View>
            <View style={styles.badge}><Text>{submission.role.replace(/_/g, ' ')}</Text></View>
          </View>
          <Text style={styles.label}>Language Used</Text>
          <Text style={styles.value}>{submission.language_used.toUpperCase()}</Text>
        </View>

        <View style={styles.divider} />

        {/* Challenge */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Challenge</Text>
          <Text style={styles.label}>Title</Text>
          <Text style={styles.value}>{submission.challenge_title}</Text>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.value}>{submission.challenge_description}</Text>
        </View>

        {submission.proposed_solution ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Proposed Solution</Text>
            <Text style={styles.value}>{submission.proposed_solution}</Text>
          </View>
        ) : null}

        {submission.background_info ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Background Information</Text>
            <Text style={styles.value}>{submission.background_info}</Text>
          </View>
        ) : null}

        {submission.suits_intl_students ? (
          <View style={[styles.section, { backgroundColor: '#eff6ff', padding: 8, borderRadius: 4 }]}>
            <Text style={{ fontSize: 9, color: '#1e40af' }}>
              ✓ This challenge is suitable for international student research projects
            </Text>
          </View>
        ) : null}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>
            {submission.reference_no} · Generated by CSERI Intake System · cseri-intake.vercel.app
          </Text>
        </View>
      </Page>
    </Document>
  )
}
```

- [ ] **Step 4: Create the PDF API route directory**

```bash
mkdir -p "/Users/ndumisomngomezulu/Downloads/CSERI/app/api/pdf/[reference]"
```

- [ ] **Step 5: Create app/api/pdf/[reference]/route.ts**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
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

  const buffer = await renderToBuffer(
    React.createElement(SubmissionPDF, { submission: data }),
  )

  return new NextResponse(buffer as unknown as BodyInit, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${reference}.pdf"`,
      'Cache-Control': 'no-store',
    },
  })
}
```

- [ ] **Step 6: Run PDF test**

```bash
npm test -- __tests__/lib/pdf.test.tsx 2>&1 | tail -10
```

Expected: `1 passed`

- [ ] **Step 7: Run all tests**

```bash
npm test 2>&1 | tail -20
```

Expected: all pass

- [ ] **Step 8: Commit**

```bash
git add lib/pdf.tsx "app/api/pdf/[reference]/route.ts" __tests__/lib/pdf.test.tsx
git commit -m "feat: PDF generation via @react-pdf/renderer — excludes contact details per POPIA"
```

---

### Task 13: Generate bcrypt Hash & Environment Variables Setup

**Files:**
- None (configuration + one-time script)

- [ ] **Step 1: Generate the admin password hash**

Run this one-time in the terminal to get the bcrypt hash for the password `cseri2026`:

```bash
node -e "const bcrypt = require('bcryptjs'); bcrypt.hash('cseri2026', 12).then(h => console.log(h))"
```

Copy the output — it will look like: `$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

- [ ] **Step 2: Generate a JWT secret**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output (96 hex chars).

- [ ] **Step 3: Create local .env.local for development**

Create `.env.local` in the project root (this file must NOT be committed — it is already in .gitignore):

```bash
cat > /Users/ndumisomngomezulu/Downloads/CSERI/.env.local << 'EOF'
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Resend
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev

# Admin auth
ADMIN_PASSWORD_HASH=$2a$12$xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
JWT_SECRET=your-96-char-hex-string-here
EOF
```

Replace all placeholder values with real ones from Supabase and Resend dashboards.

- [ ] **Step 4: Verify .env.local is gitignored**

```bash
grep -n ".env" /Users/ndumisomngomezulu/Downloads/CSERI/.gitignore
```

Expected: `.env*.local` is listed. If not, add `.env.local` manually.

- [ ] **Step 5: Set environment variables on Vercel**

In the Vercel dashboard → project → Settings → Environment Variables, add:

| Variable | Value | Environment |
|----------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | from Supabase dashboard | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from Supabase dashboard | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | from Supabase dashboard (keep secret) | Production, Preview |
| `RESEND_API_KEY` | from Resend dashboard | Production, Preview |
| `RESEND_FROM_EMAIL` | `onboarding@resend.dev` initially | Production, Preview |
| `ADMIN_PASSWORD_HASH` | bcrypt hash from Step 1 | Production, Preview |
| `JWT_SECRET` | random string from Step 2 | Production, Preview |

- [ ] **Step 6: Test dev server starts with env vars**

```bash
npm run dev &
sleep 5
curl http://localhost:3000/api/submit -X POST \
  -H "Content-Type: application/json" \
  -d '{}' 2>&1 | head -5
```

Expected: returns `{"error":"Invalid submission data",...}` (400 — proves route is live)

Kill dev server: `pkill -f "next dev"`

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: add .env.local template, document Vercel env vars for phase 2"
```

---

### Task 14: Full Build Verification & Deploy

**Files:**
- No file changes

- [ ] **Step 1: Run full test suite**

```bash
npm test 2>&1 | tail -20
```

Expected: all test suites pass

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit 2>&1
```

Expected: no errors

- [ ] **Step 3: Run production build**

```bash
npm run build 2>&1 | tail -30
```

Expected: build completes with ✓ green checkmarks. Note any warnings but ensure there are no errors.

- [ ] **Step 4: Push to GitHub**

```bash
git push origin main
```

Vercel will auto-deploy from the push.

- [ ] **Step 5: Verify deployment**

1. Navigate to https://cseri-intake.vercel.app/en
2. Complete the 5-step form — on step 5, verify the reference number is a real `CSERI-2026-NNNNN` format (not the random client-side one)
3. Check that the PDF download button is enabled
4. Check Supabase dashboard → Table Editor → submissions to confirm the row was inserted
5. Check solomonn@dut.ac.za inbox for the notification email
6. Navigate to /admin/login, enter the password — verify redirect to dashboard
7. Verify the dashboard shows the real submission
8. Click a submission → change its status → verify the status updates in the database

---

## Self-Review

**Spec coverage check:**
- ✅ Supabase database — Task 2 (schema) + Task 3 (client) + Task 5 (submit route)
- ✅ Form submission API — Task 5
- ✅ Email to solomonn@dut.ac.za — Task 4 + Task 5 (send after insert)
- ✅ Branded PDF generation — Task 12
- ✅ POPIA: contact details excluded from PDF — Task 12 (explicit field selection, no full_name/email/phone in PDF)
- ✅ Admin bcryptjs + JWT HttpOnly cookie — Tasks 7, 8, 9
- ✅ Middleware guards /admin routes — Task 8
- ✅ Dashboard with real data — Task 9, 10
- ✅ Status update from dashboard — Tasks 10, 11
- ✅ Environment variables — Task 13
- ✅ AI translation: NOT implemented (per user instruction)

**Placeholder scan:** No TBD, no TODO, all code is complete.

**Type consistency:** `Submission` type from `lib/mock-data.ts` is reused throughout (dashboard, panel, stats). The `submitAndAdvance` signature in FormContext matches Step4Challenge's call site. `requireAdminAuth` returns `NextResponse | null` consistently across both API routes that use it.

**Security review:**
- `SUPABASE_SERVICE_ROLE_KEY` only in server-side functions (`createServerSupabaseClient`) — never in client components
- `JWT_SECRET` only in server-side code (middleware, API routes, lib/auth.ts)
- `ADMIN_PASSWORD_HASH` env var — never the plaintext password
- PDF excludes `full_name`, `email`, `phone` — only fetches 12 non-contact fields
- API routes check JWT cookie directly; middleware provides defence-in-depth for page routes
