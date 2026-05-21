# CSERI Community Intake Web Application — Design Spec

**Date:** 2026-05-21  
**Built by:** Lubelo Tech Solutions  
**Client:** CSERI (Centre for Social Entrepreneurship), Durban University of Technology  

---

## Implementation Priority

**Demo scope (Phase 1 — immediate):** Frontend only — the 5-step intake form wizard, language switcher, and admin dashboard UI with mock/static data. No live Supabase connection, no email, no PDF generation required for demo.

**Full build (Phase 2):** Wire up Supabase, Resend email, PDF generation, and real-time dashboard once the demo is approved.

---

## Overview

A multilingual community intake web application that allows community members, entrepreneurs, and SMMEs across South Africa to submit real-world challenges through a guided digital form. CSERI uses the collected data to understand ground-level problems and match them to incubation programme solutions.

---

## Tech Stack

| Layer | Choice | Reason |
|-------|--------|--------|
| Framework | Next.js 14 (App Router) | Full-stack, built-in i18n routing, Server Actions, Vercel deployment |
| Database | Supabase (PostgreSQL) | Real-time subscriptions, RLS, generous free tier |
| Styling | Tailwind CSS | Utility-first, fast to build responsive layouts |
| Form handling | react-hook-form + zod | Client-side validation with server-side re-validation |
| i18n | next-intl | App Router-native locale routing |
| PDF | @react-pdf/renderer | Server-side branded PDF generation |
| Email | Resend | Simple API, reliable deliverability |
| Admin auth | bcryptjs + jose | Password hashing + signed HttpOnly JWT cookie |
| Translation | Anthropic SDK (build script) | One-time AI translation of all 11 locale files |
| Hosting | Vercel | Zero-config deployment, auto CI/CD on git push |

**Brand colours:** Navy `#142444`, Orange `#F07A1A`, Blue `#2667B1`

---

## Project Structure

```
cseri-intake/
├── app/
│   ├── [locale]/
│   │   ├── page.tsx               # 5-step intake form wizard
│   │   └── confirmation/          # Post-submission screen + PDF download
│   ├── admin/
│   │   ├── login/                 # Shared password login
│   │   └── dashboard/             # Submissions dashboard
│   └── api/
│       ├── submit/                # Form submission handler
│       └── pdf/                   # PDF generation endpoint
├── components/
│   ├── form/                      # Step1Consent, Step2Role, Step3Contact, Step4Challenge, Step5Confirm
│   ├── dashboard/                 # SubmissionsTable, SubmissionPanel, FilterBar, StatCards
│   └── ui/                        # Button, Input, Badge, LanguageSwitcher
├── lib/
│   ├── supabase.ts
│   ├── email.ts
│   └── pdf.tsx
├── messages/                      # en.json, af.json, zu.json, xh.json, st.json, tn.json, nso.json, ts.json, ss.json, ve.json, nr.json
├── scripts/
│   └── generate-translations.ts  # One-time Claude API translation script
└── middleware.ts                   # Locale detection + admin auth guard
```

---

## Form Flow

5-step wizard with a progress bar. State held in React context — users can navigate back freely.

| Step | Name | Key Fields | Notes |
|------|------|-----------|-------|
| 1 | POPIA Consent | Consent checkbox | Cannot proceed without consent |
| 2 | Role Selection | Radio: Community Member / Business Owner / CSERI Rep | |
| 3 | Contact Details | Name (required), Phone, Email, Organisation | Marked confidential in UI |
| 4 | Community Challenge | Title, Description, Category, Province, Urgency, Proposed Solution, Background Info, Suits International Students | |
| 5 | Confirmation | Reference number, submission summary, PDF download | |

**Categories (Step 4 dropdown):** Health, Education, Agriculture, Technology, Finance, Housing, Employment, Environment, Safety, Other  
**Provinces (Step 4 dropdown):** All 9 South African provinces  
**Urgency levels:** Low, Medium, High, Critical

---

## Internationalisation

- 11 official South African languages: English (`en`), Afrikaans (`af`), isiZulu (`zu`), isiXhosa (`xh`), Sesotho (`st`), Setswana (`tn`), Sepedi (`nso`), Xitsonga (`ts`), siSwati (`ss`), Tshivenḓa (`ve`), isiNdebele (`nr`)
- URL prefix routing: `/en/`, `/zu/`, `/af/` etc. via `next-intl`
- Middleware detects `Accept-Language` header and redirects to preferred locale on first visit
- Language switcher in navbar — switching locale preserves form state via `sessionStorage`
- Locale JSON files live in `/messages/` and are editable by CSERI staff at any time
- **Translation generation:** `scripts/generate-translations.ts` calls the Claude API to translate `en.json` into all 10 remaining languages. Run once at setup, output committed to repo.
- PDF generated in the language the user submitted in

---

## Database Schema (Supabase)

```sql
create table submissions (
  id                    uuid primary key default gen_random_uuid(),
  reference_no          text unique not null,         -- e.g. CSERI-2026-00142
  created_at            timestamptz default now(),

  -- Role
  role                  text not null,                -- 'community_member' | 'business_owner' | 'cseri_rep'

  -- Contact (confidential)
  full_name             text not null,
  email                 text,
  phone                 text,
  organisation          text,

  -- Challenge
  challenge_title       text not null,
  challenge_description text not null,
  category              text not null,
  province              text not null,
  urgency               text not null,               -- 'low' | 'medium' | 'high' | 'critical'
  proposed_solution     text,
  background_info       text,
  suits_intl_students   boolean default false,

  -- Meta
  language_used         text not null,
  popia_consent         boolean not null,
  status                text default 'new'            -- 'new' | 'reviewing' | 'matched' | 'closed'
);

create sequence submission_seq start 1;

create or replace function generate_reference()
returns text as $$
  select 'CSERI-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('submission_seq')::text, 5, '0');
$$ language sql;
```

- Row-level security enabled on Supabase
- Public form submits via service role key (server-side only, never exposed to client)
- Admin dashboard reads via same service role key after session verification

---

## Admin Dashboard

**Route:** `/admin/dashboard`  
**Auth:** Single shared password, bcrypt-hashed, stored in env var. On login a signed HttpOnly JWT cookie is set (7-day expiry). Middleware guards all `/admin/*` routes.

**Dashboard features:**
- Stat cards: Total, New, Reviewing, Matched submissions
- Filterable table: category, province, urgency, status, role, date range
- Full-text search across name, description, reference number
- Click a row → side panel with full submission details including contact info
- Status updates from panel (New → Reviewing → Matched → Closed)
- Real-time updates via Supabase REALTIME subscription (no refresh needed)
- CSV export of all submissions

**Urgency colour coding:**
- Critical → Red
- High → Orange `#F07A1A`
- Medium → Blue `#2667B1`
- Low → Grey

Category and province shown as navy `#142444` badges.

---

## PDF Generation

**Endpoint:** `GET /api/pdf?id=[submission_id]`  
**Library:** `@react-pdf/renderer` (server-side)

PDF contents:
- CSERI logo + header (navy/orange branding)
- Reference number, submission date, language used
- Role, Province, Category, Urgency
- Challenge description and proposed solution
- Background information (if provided)
- Suits international students indicator
- Footer: "Built by Lubelo Tech Solutions" + "Contact details are confidential and not included in this document"

Contact details (name, phone, email) are **excluded** from the PDF for POPIA compliance. The download link on the confirmation screen calls `/api/pdf?id=[submission_id]` which generates the PDF on demand — no expiry, no storage bucket needed.

---

## Email Notifications

**Provider:** Resend  
**Recipient:** `solomonn@dut.ac.za`  
**Trigger:** Every successful form submission

Email content:
- Subject: `New CSERI Intake Submission — [reference_no]`
- Body: Reference number, category, province, urgency, role, date submitted, link to admin dashboard
- Contact details (name, phone, email) included in email body for staff use

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_PASSWORD_HASH=          # bcrypt hash of the shared admin password
JWT_SECRET=                   # for signing session cookie
RESEND_API_KEY=
ANTHROPIC_API_KEY=            # used only by the translation generation script
```

---

## Deployment

- **App:** Vercel (free tier) — auto-deploys on git push to main
- **Database:** Supabase (free tier, 500MB)
- **Custom domain:** `intake.cseri.co.za` pointed to Vercel via DNS CNAME
