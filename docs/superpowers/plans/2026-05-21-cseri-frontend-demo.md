# CSERI Community Intake — Frontend Implementation Plan (Demo Phase)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multilingual 5-step community intake form and admin dashboard frontend for CSERI — demo-ready with mock data, no backend required.

**Architecture:** Next.js 14 App Router with locale-prefixed routes (`/en/`, `/zu/`, etc.) via `next-intl`. Multi-step form state held in React context. Admin dashboard renders mock data. No Supabase, email, or PDF in this phase.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, next-intl, react-hook-form, zod, Jest, @testing-library/react

---

## File Map

```
app/
  layout.tsx                          # Root layout (html/body)
  [locale]/
    layout.tsx                        # Locale layout with NextIntlClientProvider
    page.tsx                          # Intake form page
    confirmation/page.tsx             # Post-submit confirmation
  admin/
    login/page.tsx                    # Admin login (mock auth)
    dashboard/page.tsx                # Admin dashboard page

components/
  Navbar.tsx                          # CSERI branded top nav + language switcher
  ui/
    Button.tsx                        # Primary/secondary/outline variants
    Input.tsx                         # Labelled text input
    Textarea.tsx                      # Labelled textarea
    Select.tsx                        # Labelled select dropdown
    Badge.tsx                         # Category/province/urgency badges
    LanguageSwitcher.tsx              # Locale dropdown
  form/
    FormWizard.tsx                    # Step container + back/next buttons
    ProgressBar.tsx                   # 5-step progress indicator
    Step1Consent.tsx                  # POPIA consent
    Step2Role.tsx                     # Role selection
    Step3Contact.tsx                  # Contact details
    Step4Challenge.tsx                # Challenge details
    Step5Confirm.tsx                  # Confirmation screen
  dashboard/
    StatsCards.tsx                    # Total/New/Reviewing/Matched cards
    FilterBar.tsx                     # Category/province/urgency/status filters
    SubmissionsTable.tsx              # Filterable submissions list
    SubmissionPanel.tsx               # Slide-out detail panel

lib/
  constants.ts                        # Categories, provinces, urgency levels, locales
  schemas.ts                          # Zod schemas for steps 2-4
  form-context.tsx                    # React context for multi-step state
  mock-data.ts                        # Realistic mock submissions array

messages/
  en.json                             # Complete English strings
  af.json zu.json xh.json ...        # AI-generated (10 other locales)

scripts/
  generate-translations.ts           # One-time Claude API translation script

i18n/request.ts                      # next-intl server config
navigation.ts                        # Typed next-intl navigation helpers
middleware.ts                         # Locale routing middleware
next.config.ts                        # next-intl plugin

__tests__/
  lib/schemas.test.ts
  components/ui/Button.test.tsx
  components/form/FormWizard.test.tsx
  components/form/Step1Consent.test.tsx
  components/form/Step2Role.test.tsx
  components/form/Step3Contact.test.tsx
  components/form/Step4Challenge.test.tsx
```

---

## Task 1: Project Initialization

**Files:** `package.json`, `jest.config.ts`, `jest.setup.ts`

- [ ] **Step 1: Scaffold Next.js project**

Run from `/Users/ndumisomngomezulu/Downloads/CSERI/`:

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias="@/*" --eslint
```

Accept all interactive prompts with the defaults. When asked about the `src/` directory, choose **No**.

- [ ] **Step 2: Install runtime dependencies**

```bash
npm install next-intl react-hook-form zod
```

- [ ] **Step 3: Install dev/test dependencies**

```bash
npm install --save-dev jest jest-environment-jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 4: Create `jest.config.ts`**

```ts
import type { Config } from 'jest'
import nextJest from 'next/jest'

const createJestConfig = nextJest({ dir: './' })

const config: Config = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
}

export default createJestConfig(config)
```

- [ ] **Step 5: Create `jest.setup.ts`**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 6: Add test script to `package.json`**

In `package.json`, ensure the `scripts` section includes:

```json
"test": "jest",
"test:watch": "jest --watch"
```

- [ ] **Step 7: Verify Jest runs**

```bash
npx jest --passWithNoTests
```

Expected: `No tests found, exiting with code 0` or similar passing output.

- [ ] **Step 8: Commit**

```bash
git init
git add .
git commit -m "chore: initialize Next.js 14 project with Tailwind, TypeScript, Jest"
```

---

## Task 2: Tailwind Brand Colours + Global Styles

**Files:** `tailwind.config.ts`, `app/globals.css`

- [ ] **Step 1: Extend `tailwind.config.ts` with CSERI colours**

Open `tailwind.config.ts` and replace the `theme` section with:

```ts
import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cseri: {
          navy: '#142444',
          orange: '#F07A1A',
          blue: '#2667B1',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
```

- [ ] **Step 2: Update `app/globals.css`**

Replace the contents of `app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900 antialiased;
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.ts app/globals.css
git commit -m "chore: configure CSERI brand colours in Tailwind"
```

---

## Task 3: next-intl Setup

**Files:** `next.config.ts`, `i18n/request.ts`, `navigation.ts`, `middleware.ts`

- [ ] **Step 1: Update `next.config.ts`**

```ts
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl({})
```

- [ ] **Step 2: Create `i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../messages/${locale}.json`)).default,
}))
```

- [ ] **Step 3: Create `navigation.ts`**

```ts
import { createNavigation } from 'next-intl/navigation'

export const locales = [
  'en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 'ss', 've', 'nr',
] as const

export type Locale = (typeof locales)[number]

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales })
```

- [ ] **Step 4: Create `middleware.ts`**

```ts
import createMiddleware from 'next-intl/middleware'
import { locales } from './navigation'

export default createMiddleware({
  locales,
  defaultLocale: 'en',
})

export const config = {
  matcher: ['/((?!api|admin|_next|.*\\..*).*)'],
}
```

- [ ] **Step 5: Commit**

```bash
git add next.config.ts i18n/request.ts navigation.ts middleware.ts
git commit -m "feat: configure next-intl for 11 SA language locales"
```

---

## Task 4: English Locale File

**Files:** `messages/en.json`

- [ ] **Step 1: Create `messages/en.json`**

```json
{
  "common": {
    "appName": "CSERI Community Intake",
    "next": "Next",
    "back": "Back",
    "submit": "Submit",
    "required": "Required",
    "confidential": "Confidential — not published",
    "step": "Step",
    "of": "of"
  },
  "nav": {
    "language": "Language",
    "admin": "Admin"
  },
  "steps": {
    "1": "Consent",
    "2": "Role",
    "3": "Contact",
    "4": "Challenge",
    "5": "Confirm"
  },
  "step1": {
    "title": "Privacy & POPIA Consent",
    "subtitle": "Your information is protected under the Protection of Personal Information Act (POPIA)",
    "body": "CSERI (Centre for Social Entrepreneurship) at the Durban University of Technology collects your information solely to understand community challenges and match them to incubation programme solutions. Your contact details are confidential and will never be published or shared without your consent.",
    "checkboxLabel": "I understand and consent to my information being collected and used as described above",
    "error": "You must consent to continue"
  },
  "step2": {
    "title": "Who are you?",
    "subtitle": "Select the option that best describes you",
    "community_member": "Community Member",
    "business_owner": "Business Owner / SMME",
    "cseri_rep": "CSERI Representative",
    "error": "Please select a role to continue"
  },
  "step3": {
    "title": "Contact Details",
    "subtitle": "Your contact information is confidential and will not be published",
    "fullName": "Full Name",
    "email": "Email Address",
    "phone": "Phone Number",
    "organisation": "Organisation / Business Name",
    "fullNameError": "Full name is required",
    "emailError": "Please enter a valid email address"
  },
  "step4": {
    "title": "Community Challenge",
    "subtitle": "Tell us about the challenge your community is facing",
    "challengeTitle": "Challenge Title",
    "challengeDescription": "Challenge Description",
    "challengeDescriptionHint": "Describe the problem in as much detail as possible",
    "category": "Category",
    "province": "Province",
    "urgency": "Urgency Level",
    "proposedSolution": "Proposed Solution (optional)",
    "backgroundInfo": "Background Information (optional)",
    "suitsIntlStudents": "This challenge could be addressed by international students",
    "selectCategory": "Select a category",
    "selectProvince": "Select a province",
    "selectUrgency": "Select urgency level",
    "titleError": "Challenge title is required",
    "descriptionError": "Challenge description is required",
    "categoryError": "Please select a category",
    "provinceError": "Please select a province",
    "urgencyError": "Please select an urgency level"
  },
  "step5": {
    "title": "Submission Confirmed!",
    "subtitle": "Thank you for submitting your community challenge. CSERI will review it and be in touch.",
    "referenceLabel": "Your Reference Number",
    "downloadPdf": "Download PDF",
    "pdfNote": "PDF download available in the full version",
    "newSubmission": "Submit Another Challenge",
    "summaryTitle": "What happens next?",
    "next1": "CSERI reviews your challenge submission",
    "next2": "Your challenge is matched to relevant incubation programmes",
    "next3": "A CSERI representative will contact you if a match is found"
  },
  "categories": {
    "health": "Health",
    "education": "Education",
    "agriculture": "Agriculture",
    "technology": "Technology",
    "finance": "Finance",
    "housing": "Housing",
    "employment": "Employment",
    "environment": "Environment",
    "safety": "Safety",
    "other": "Other"
  },
  "provinces": {
    "ec": "Eastern Cape",
    "fs": "Free State",
    "gp": "Gauteng",
    "kzn": "KwaZulu-Natal",
    "lp": "Limpopo",
    "mp": "Mpumalanga",
    "nc": "Northern Cape",
    "nw": "North West",
    "wc": "Western Cape"
  },
  "urgency": {
    "low": "Low",
    "medium": "Medium",
    "high": "High",
    "critical": "Critical"
  },
  "admin": {
    "title": "CSERI Admin Dashboard",
    "loginTitle": "Admin Login",
    "password": "Password",
    "loginButton": "Sign In",
    "logout": "Logout",
    "total": "Total",
    "new": "New",
    "reviewing": "Reviewing",
    "matched": "Matched",
    "searchPlaceholder": "Search by reference, name, or description...",
    "filterCategory": "Category",
    "filterProvince": "Province",
    "filterUrgency": "Urgency",
    "filterStatus": "Status",
    "allCategories": "All Categories",
    "allProvinces": "All Provinces",
    "allUrgencies": "All Urgencies",
    "allStatuses": "All Statuses",
    "colRef": "Reference",
    "colDate": "Date",
    "colRole": "Role",
    "colCategory": "Category",
    "colProvince": "Province",
    "colUrgency": "Urgency",
    "colStatus": "Status",
    "noResults": "No submissions match your filters",
    "exportCsv": "Export CSV",
    "close": "Close",
    "contactDetails": "Contact Details",
    "challengeDetails": "Challenge Details",
    "statusNew": "New",
    "statusReviewing": "Reviewing",
    "statusMatched": "Matched",
    "statusClosed": "Closed"
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add messages/en.json
git commit -m "feat: add complete English locale file"
```

---

## Task 5: Translation Generation Script

**Files:** `scripts/generate-translations.ts`, `messages/af.json` through `messages/nr.json`

- [ ] **Step 1: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 2: Create `scripts/generate-translations.ts`**

```ts
import Anthropic from '@anthropic-ai/sdk'
import * as fs from 'fs'
import * as path from 'path'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const locales: Record<string, string> = {
  af: 'Afrikaans',
  zu: 'isiZulu',
  xh: 'isiXhosa',
  st: 'Sesotho',
  tn: 'Setswana',
  nso: 'Sepedi (Northern Sotho)',
  ts: 'Xitsonga',
  ss: 'siSwati',
  ve: 'Tshivenḓa',
  nr: 'isiNdebele',
}

async function translate(content: object, targetLanguage: string): Promise<object> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 8192,
    messages: [
      {
        role: 'user',
        content: `Translate the following JSON object values into ${targetLanguage}. 
Keep all JSON keys exactly as-is. Only translate the string values.
Do not translate: reference codes (CSERI-*), email addresses, URLs, proper nouns like "CSERI", "DUT", "POPIA", "KwaZulu-Natal", province names, or category names that are international terms.
Return only valid JSON with no additional text or markdown.

${JSON.stringify(content, null, 2)}`,
      },
    ],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''
  return JSON.parse(text)
}

async function main() {
  const enPath = path.join(process.cwd(), 'messages', 'en.json')
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'))

  for (const [code, name] of Object.entries(locales)) {
    console.log(`Translating to ${name} (${code})...`)
    const translated = await translate(enContent, name)
    const outPath = path.join(process.cwd(), 'messages', `${code}.json`)
    fs.writeFileSync(outPath, JSON.stringify(translated, null, 2))
    console.log(`  ✓ Written to messages/${code}.json`)
  }
}

main().catch(console.error)
```

- [ ] **Step 3: Run the translation script**

```bash
ANTHROPIC_API_KEY=your_key_here npx ts-node --project tsconfig.json scripts/generate-translations.ts
```

Expected: 10 new files created in `messages/` — `af.json`, `zu.json`, `xh.json`, `st.json`, `tn.json`, `nso.json`, `ts.json`, `ss.json`, `ve.json`, `nr.json`.

- [ ] **Step 4: Verify one locale file is valid JSON**

```bash
node -e "require('./messages/zu.json'); console.log('Valid JSON')"
```

Expected: `Valid JSON`

- [ ] **Step 5: Commit**

```bash
git add messages/ scripts/
git commit -m "feat: add AI-generated translations for all 11 SA languages"
```

---

## Task 6: Constants + Zod Schemas

**Files:** `lib/constants.ts`, `lib/schemas.ts`, `__tests__/lib/schemas.test.ts`

- [ ] **Step 1: Write failing schema tests**

Create `__tests__/lib/schemas.test.ts`:

```ts
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
npx jest __tests__/lib/schemas.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/schemas'`

- [ ] **Step 3: Create `lib/constants.ts`**

```ts
export const CATEGORIES = [
  'health', 'education', 'agriculture', 'technology',
  'finance', 'housing', 'employment', 'environment', 'safety', 'other',
] as const

export const PROVINCES = [
  'ec', 'fs', 'gp', 'kzn', 'lp', 'mp', 'nc', 'nw', 'wc',
] as const

export const URGENCY_LEVELS = ['low', 'medium', 'high', 'critical'] as const

export const ROLES = ['community_member', 'business_owner', 'cseri_rep'] as const

export const LOCALES = [
  { code: 'en', name: 'English' },
  { code: 'af', name: 'Afrikaans' },
  { code: 'zu', name: 'isiZulu' },
  { code: 'xh', name: 'isiXhosa' },
  { code: 'st', name: 'Sesotho' },
  { code: 'tn', name: 'Setswana' },
  { code: 'nso', name: 'Sepedi' },
  { code: 'ts', name: 'Xitsonga' },
  { code: 'ss', name: 'siSwati' },
  { code: 've', name: 'Tshivenḓa' },
  { code: 'nr', name: 'isiNdebele' },
] as const

export type Category = (typeof CATEGORIES)[number]
export type Province = (typeof PROVINCES)[number]
export type UrgencyLevel = (typeof URGENCY_LEVELS)[number]
export type Role = (typeof ROLES)[number]
```

- [ ] **Step 4: Create `lib/schemas.ts`**

```ts
import { z } from 'zod'
import { CATEGORIES, PROVINCES, URGENCY_LEVELS, ROLES } from './constants'

export const step2Schema = z.object({
  role: z.enum(ROLES, { required_error: 'Please select a role' }),
})

export const step3Schema = z.object({
  full_name: z.string().min(1, 'Full name is required'),
  email: z.union([z.literal(''), z.string().email('Please enter a valid email address')]),
  phone: z.string().optional().default(''),
  organisation: z.string().optional().default(''),
})

export const step4Schema = z.object({
  challenge_title: z.string().min(1, 'Challenge title is required'),
  challenge_description: z.string().min(1, 'Challenge description is required'),
  category: z.enum(CATEGORIES, { required_error: 'Please select a category' }),
  province: z.enum(PROVINCES, { required_error: 'Please select a province' }),
  urgency: z.enum(URGENCY_LEVELS, { required_error: 'Please select an urgency level' }),
  proposed_solution: z.string().optional().default(''),
  background_info: z.string().optional().default(''),
  suits_intl_students: z.boolean().default(false),
})

export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
npx jest __tests__/lib/schemas.test.ts
```

Expected: PASS — 6 tests passing.

- [ ] **Step 6: Commit**

```bash
git add lib/constants.ts lib/schemas.ts __tests__/lib/schemas.test.ts
git commit -m "feat: add constants and Zod validation schemas for form steps"
```

---

## Task 7: Shared UI Components

**Files:** `components/ui/Button.tsx`, `components/ui/Badge.tsx`, `components/ui/Input.tsx`, `components/ui/Select.tsx`, `components/ui/Textarea.tsx`, `__tests__/components/ui/Button.test.tsx`

- [ ] **Step 1: Write failing Button test**

Create `__tests__/components/ui/Button.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/Button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/ui/Button.test.tsx
```

Expected: FAIL — `Cannot find module '@/components/ui/Button'`

- [ ] **Step 3: Create `components/ui/Button.tsx`**

```tsx
import { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'primary' | 'secondary' | 'outline'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  const base = 'inline-flex items-center justify-center px-6 py-2.5 rounded-md font-semibold text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  const variants: Record<Variant, string> = {
    primary: 'bg-cseri-orange text-white hover:bg-orange-600 focus:ring-cseri-orange',
    secondary: 'bg-cseri-navy text-white hover:bg-blue-900 focus:ring-cseri-navy',
    outline: 'border-2 border-cseri-navy text-cseri-navy hover:bg-cseri-navy hover:text-white focus:ring-cseri-navy',
  }
  return (
    <button className={cn(base, variants[variant], className)} {...props}>
      {children}
    </button>
  )
}
```

- [ ] **Step 4: Create `lib/utils.ts`** (needed by Button)

```ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

Install the deps:

```bash
npm install clsx tailwind-merge
```

- [ ] **Step 5: Run Button test to verify it passes**

```bash
npx jest __tests__/components/ui/Button.test.tsx
```

Expected: PASS

- [ ] **Step 6: Create `components/ui/Badge.tsx`**

```tsx
import { cn } from '@/lib/utils'

type BadgeVariant = 'navy' | 'orange' | 'blue' | 'red' | 'green' | 'gray'

interface BadgeProps {
  children: React.ReactNode
  variant?: BadgeVariant
  className?: string
}

export function Badge({ children, variant = 'navy', className }: BadgeProps) {
  const variants: Record<BadgeVariant, string> = {
    navy: 'bg-cseri-navy text-white',
    orange: 'bg-cseri-orange text-white',
    blue: 'bg-cseri-blue text-white',
    red: 'bg-red-600 text-white',
    green: 'bg-green-600 text-white',
    gray: 'bg-gray-200 text-gray-700',
  }
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', variants[variant], className)}>
      {children}
    </span>
  )
}
```

- [ ] **Step 7: Create `components/ui/Input.tsx`**

```tsx
import { InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
}

export function Input({ label, error, hint, className, id, ...props }: InputProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <input
        id={inputId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-cseri-blue focus:border-cseri-blue',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 8: Create `components/ui/Textarea.tsx`**

```tsx
import { TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500">{hint}</p>}
      <textarea
        id={inputId}
        rows={4}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors resize-y',
          'focus:outline-none focus:ring-2 focus:ring-cseri-blue focus:border-cseri-blue',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 9: Create `components/ui/Select.tsx`**

```tsx
import { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  placeholder?: string
  options: { value: string; label: string }[]
}

export function Select({ label, error, placeholder, options, className, id, ...props }: SelectProps) {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-')
  return (
    <div className="space-y-1">
      <label htmlFor={inputId} className="block text-sm font-medium text-gray-700">
        {label}
        {props.required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <select
        id={inputId}
        className={cn(
          'w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors bg-white',
          'focus:outline-none focus:ring-2 focus:ring-cseri-blue focus:border-cseri-blue',
          error ? 'border-red-500' : 'border-gray-300',
          className,
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(({ value, label }) => (
          <option key={value} value={value}>{label}</option>
        ))}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  )
}
```

- [ ] **Step 10: Run all tests**

```bash
npx jest
```

Expected: All existing tests pass.

- [ ] **Step 11: Commit**

```bash
git add components/ui/ lib/utils.ts __tests__/components/ui/
git commit -m "feat: add shared UI components (Button, Badge, Input, Select, Textarea)"
```

---

## Task 8: Navbar + Language Switcher

**Files:** `components/ui/LanguageSwitcher.tsx`, `components/Navbar.tsx`

- [ ] **Step 1: Create `components/ui/LanguageSwitcher.tsx`**

```tsx
'use client'

import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/navigation'
import { LOCALES } from '@/lib/constants'

export function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    router.replace(pathname, { locale: e.target.value })
  }

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="text-sm border border-white/30 bg-white/10 text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-white"
      aria-label="Select language"
    >
      {LOCALES.map(({ code, name }) => (
        <option key={code} value={code} className="text-gray-900">
          {name}
        </option>
      ))}
    </select>
  )
}
```

- [ ] **Step 2: Create `components/Navbar.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { Link } from '@/navigation'
import { LanguageSwitcher } from './ui/LanguageSwitcher'

export function Navbar() {
  const t = useTranslations('nav')

  return (
    <nav className="bg-cseri-navy text-white">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cseri-orange rounded-full flex items-center justify-center font-bold text-sm">
            C
          </div>
          <div>
            <p className="font-bold text-sm leading-tight">CSERI</p>
            <p className="text-xs text-blue-200 leading-tight">Community Intake</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/admin/login"
            locale={false}
            className="text-xs text-blue-200 hover:text-white transition-colors"
          >
            {t('admin')}
          </Link>
        </div>
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/ui/LanguageSwitcher.tsx components/Navbar.tsx
git commit -m "feat: add CSERI branded Navbar with language switcher"
```

---

## Task 9: App Layouts

**Files:** `app/layout.tsx`, `app/[locale]/layout.tsx`

- [ ] **Step 1: Update `app/layout.tsx`**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CSERI Community Intake',
  description: 'Submit your community challenge to CSERI at Durban University of Technology',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>{children}</body>
    </html>
  )
}
```

- [ ] **Step 2: Create `app/[locale]/layout.tsx`**

```tsx
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { notFound } from 'next/navigation'
import { locales } from '@/navigation'
import { Navbar } from '@/components/Navbar'

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale as any)) notFound()

  const messages = await getMessages()

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50">
        <NextIntlClientProvider messages={messages}>
          <Navbar />
          <main>{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add app/layout.tsx app/[locale]/layout.tsx
git commit -m "feat: add root and locale layouts with NextIntlClientProvider"
```

---

## Task 10: Form State Context

**Files:** `lib/form-context.tsx`, `__tests__/components/form/FormWizard.test.tsx`

- [ ] **Step 1: Write failing FormWizard test**

Create `__tests__/components/form/FormWizard.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { FormProvider, useFormContext } from '@/lib/form-context'

function StepDisplay() {
  const { currentStep, nextStep, prevStep } = useFormContext()
  return (
    <div>
      <span data-testid="step">{currentStep}</span>
      <button onClick={nextStep}>Next</button>
      <button onClick={prevStep}>Back</button>
    </div>
  )
}

describe('FormContext', () => {
  it('starts at step 1', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    expect(screen.getByTestId('step')).toHaveTextContent('1')
  })

  it('advances to step 2 on nextStep', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    fireEvent.click(screen.getByText('Next'))
    expect(screen.getByTestId('step')).toHaveTextContent('2')
  })

  it('does not go below step 1 on prevStep', () => {
    render(<FormProvider><StepDisplay /></FormProvider>)
    fireEvent.click(screen.getByText('Back'))
    expect(screen.getByTestId('step')).toHaveTextContent('1')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/form/FormWizard.test.tsx
```

Expected: FAIL — `Cannot find module '@/lib/form-context'`

- [ ] **Step 3: Create `lib/form-context.tsx`**

```tsx
'use client'

import { createContext, useContext, useState } from 'react'
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
  setChallenge: (data: Step4Data) => void
  referenceNo: string
}

const FormContext = createContext<FormContextValue | null>(null)

export function useFormContext() {
  const ctx = useContext(FormContext)
  if (!ctx) throw new Error('useFormContext must be used within FormProvider')
  return ctx
}

function generateReference() {
  const year = new Date().getFullYear()
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, '0')
  return `CSERI-${year}-${seq}`
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({ popia_consent: false })
  const [referenceNo] = useState(generateReference)

  const nextStep = () => setCurrentStep((s) => Math.min(s + 1, 5))
  const prevStep = () => setCurrentStep((s) => Math.max(s - 1, 1))
  const setConsent = (value: boolean) => setFormData((d) => ({ ...d, popia_consent: value }))
  const setRole = (role: Role) => setFormData((d) => ({ ...d, role }))
  const setContact = (contact: Step3Data) => setFormData((d) => ({ ...d, contact }))
  const setChallenge = (challenge: Step4Data) => setFormData((d) => ({ ...d, challenge }))

  return (
    <FormContext.Provider value={{ currentStep, formData, nextStep, prevStep, setConsent, setRole, setContact, setChallenge, referenceNo }}>
      {children}
    </FormContext.Provider>
  )
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx jest __tests__/components/form/FormWizard.test.tsx
```

Expected: PASS — 3 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/form-context.tsx __tests__/components/form/FormWizard.test.tsx
git commit -m "feat: add multi-step form state context"
```

---

## Task 11: FormWizard + ProgressBar + Step 1 (POPIA Consent)

**Files:** `components/form/ProgressBar.tsx`, `components/form/FormWizard.tsx`, `components/form/Step1Consent.tsx`, `__tests__/components/form/Step1Consent.test.tsx`

- [ ] **Step 1: Write failing Step1 test**

Create `__tests__/components/form/Step1Consent.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step1Consent } from '@/components/form/Step1Consent'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step1Consent', () => {
  it('renders the POPIA title', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByText(en.step1.title)).toBeInTheDocument()
  })

  it('renders the consent checkbox', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByRole('checkbox')).toBeInTheDocument()
  })

  it('Next button is disabled without consent', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: en.common.next })).toBeDisabled()
  })

  it('Next button enables after checking consent', () => {
    render(<Step1Consent />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('checkbox'))
    expect(screen.getByRole('button', { name: en.common.next })).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/form/Step1Consent.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `components/form/ProgressBar.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { cn } from '@/lib/utils'

interface ProgressBarProps {
  currentStep: number
  totalSteps?: number
}

export function ProgressBar({ currentStep, totalSteps = 5 }: ProgressBarProps) {
  const t = useTranslations('steps')
  const stepKeys = ['1', '2', '3', '4', '5'] as const

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        {stepKeys.map((key, idx) => {
          const step = idx + 1
          const isComplete = step < currentStep
          const isCurrent = step === currentStep
          return (
            <div key={key} className="flex flex-col items-center flex-1">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 transition-colors',
                isComplete && 'bg-cseri-orange text-white',
                isCurrent && 'bg-cseri-navy text-white ring-2 ring-cseri-orange ring-offset-2',
                !isComplete && !isCurrent && 'bg-gray-200 text-gray-500',
              )}>
                {isComplete ? '✓' : step}
              </div>
              <span className={cn(
                'text-xs text-center hidden sm:block',
                isCurrent ? 'text-cseri-navy font-semibold' : 'text-gray-400',
              )}>
                {t(key)}
              </span>
            </div>
          )
        })}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-cseri-orange h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/form/Step1Consent.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'

export function Step1Consent() {
  const t = useTranslations('step1')
  const tc = useTranslations('common')
  const { nextStep, setConsent } = useFormContext()
  const [checked, setChecked] = useState(false)

  function handleCheck(e: React.ChangeEvent<HTMLInputElement>) {
    setChecked(e.target.checked)
    setConsent(e.target.checked)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-blue-50 border border-cseri-blue/20 rounded-lg p-4 text-sm text-gray-700 leading-relaxed">
        {t('body')}
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheck}
          className="mt-0.5 w-4 h-4 accent-cseri-orange"
        />
        <span className="text-sm text-gray-700">{t('checkboxLabel')}</span>
      </label>

      <div className="flex justify-end">
        <Button onClick={nextStep} disabled={!checked}>
          {tc('next')}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create `components/form/FormWizard.tsx`**

```tsx
'use client'

import { useFormContext } from '@/lib/form-context'
import { ProgressBar } from './ProgressBar'
import { Step1Consent } from './Step1Consent'
import { Step2Role } from './Step2Role'
import { Step3Contact } from './Step3Contact'
import { Step4Challenge } from './Step4Challenge'
import { Step5Confirm } from './Step5Confirm'

const STEPS = [Step1Consent, Step2Role, Step3Contact, Step4Challenge, Step5Confirm]

export function FormWizard() {
  const { currentStep } = useFormContext()
  const StepComponent = STEPS[currentStep - 1]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sm:p-8">
      <div className="mb-8">
        <ProgressBar currentStep={currentStep} />
      </div>
      <StepComponent />
    </div>
  )
}
```

- [ ] **Step 6: Run tests to verify they pass**

```bash
npx jest __tests__/components/form/Step1Consent.test.tsx
```

Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add components/form/ __tests__/components/form/Step1Consent.test.tsx
git commit -m "feat: add FormWizard, ProgressBar, and Step 1 POPIA consent"
```

---

## Task 12: Step 2 (Role) + Step 3 (Contact)

**Files:** `components/form/Step2Role.tsx`, `components/form/Step3Contact.tsx`, tests

- [ ] **Step 1: Write failing Step2 test**

Create `__tests__/components/form/Step2Role.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step2Role } from '@/components/form/Step2Role'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step2Role', () => {
  it('renders all three role options', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    expect(screen.getByText(en.step2.community_member)).toBeInTheDocument()
    expect(screen.getByText(en.step2.business_owner)).toBeInTheDocument()
    expect(screen.getByText(en.step2.cseri_rep)).toBeInTheDocument()
  })

  it('Next button is disabled without selection', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    expect(screen.getByRole('button', { name: en.common.next })).toBeDisabled()
  })

  it('Next button enables after selecting a role', () => {
    render(<Step2Role />, { wrapper: Wrapper })
    fireEvent.click(screen.getByText(en.step2.community_member))
    expect(screen.getByRole('button', { name: en.common.next })).not.toBeDisabled()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/form/Step2Role.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `components/form/Step2Role.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { Role } from '@/lib/constants'

const ROLES: Role[] = ['community_member', 'business_owner', 'cseri_rep']

export function Step2Role() {
  const t = useTranslations('step2')
  const tc = useTranslations('common')
  const { nextStep, prevStep, setRole } = useFormContext()
  const [selected, setSelected] = useState<Role | null>(null)

  function handleSelect(role: Role) {
    setSelected(role)
    setRole(role)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-3">
        {ROLES.map((role) => (
          <button
            key={role}
            type="button"
            onClick={() => handleSelect(role)}
            className={cn(
              'w-full text-left rounded-lg border-2 px-5 py-4 transition-all',
              selected === role
                ? 'border-cseri-orange bg-orange-50 text-cseri-navy font-semibold'
                : 'border-gray-200 hover:border-cseri-blue hover:bg-blue-50',
            )}
          >
            {t(role)}
          </button>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button onClick={nextStep} disabled={!selected}>{tc('next')}</Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Write failing Step3 test**

Create `__tests__/components/form/Step3Contact.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step3Contact } from '@/components/form/Step3Contact'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step3Contact', () => {
  it('renders the full name field', () => {
    render(<Step3Contact />, { wrapper: Wrapper })
    expect(screen.getByLabelText(new RegExp(en.step3.fullName, 'i'))).toBeInTheDocument()
  })

  it('shows error if Next clicked without full name', async () => {
    render(<Step3Contact />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: en.common.next }))
    expect(await screen.findByText(en.step3.fullNameError)).toBeInTheDocument()
  })
})
```

- [ ] **Step 5: Run test to verify it fails**

```bash
npx jest __tests__/components/form/Step3Contact.test.tsx
```

Expected: FAIL

- [ ] **Step 6: Create `components/form/Step3Contact.tsx`**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { step3Schema, type Step3Data } from '@/lib/schemas'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export function Step3Contact() {
  const t = useTranslations('step3')
  const tc = useTranslations('common')
  const { nextStep, prevStep, setContact, formData } = useFormContext()

  const { register, handleSubmit, formState: { errors } } = useForm<Step3Data>({
    resolver: zodResolver(step3Schema),
    defaultValues: formData.contact ?? { full_name: '', email: '', phone: '', organisation: '' },
  })

  function onSubmit(data: Step3Data) {
    setContact(data)
    nextStep()
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Input
          label={t('fullName')}
          required
          error={errors.full_name?.message}
          {...register('full_name')}
        />
        <Input
          label={t('email')}
          type="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('phone')}
          type="tel"
          {...register('phone')}
        />
        <Input
          label={t('organisation')}
          {...register('organisation')}
        />
      </div>

      <p className="text-xs text-gray-400 italic">{tc('confidential')}</p>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button type="submit">{tc('next')}</Button>
      </div>
    </form>
  )
}
```

Install the zod resolver:

```bash
npm install @hookform/resolvers
```

- [ ] **Step 7: Run all tests**

```bash
npx jest
```

Expected: All tests pass.

- [ ] **Step 8: Commit**

```bash
git add components/form/Step2Role.tsx components/form/Step3Contact.tsx __tests__/components/form/
git commit -m "feat: add Step 2 (role selection) and Step 3 (contact details)"
```

---

## Task 13: Step 4 (Challenge Details)

**Files:** `components/form/Step4Challenge.tsx`, `__tests__/components/form/Step4Challenge.test.tsx`

- [ ] **Step 1: Write failing Step4 test**

Create `__tests__/components/form/Step4Challenge.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { Step4Challenge } from '@/components/form/Step4Challenge'
import en from '@/messages/en.json'

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <NextIntlClientProvider locale="en" messages={en}>
      <FormProvider>{children}</FormProvider>
    </NextIntlClientProvider>
  )
}

describe('Step4Challenge', () => {
  it('renders the challenge title field', () => {
    render(<Step4Challenge />, { wrapper: Wrapper })
    expect(screen.getByLabelText(new RegExp(en.step4.challengeTitle, 'i'))).toBeInTheDocument()
  })

  it('shows validation error for empty title on submit', async () => {
    render(<Step4Challenge />, { wrapper: Wrapper })
    fireEvent.click(screen.getByRole('button', { name: en.common.next }))
    expect(await screen.findByText(en.step4.titleError)).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx jest __tests__/components/form/Step4Challenge.test.tsx
```

Expected: FAIL

- [ ] **Step 3: Create `components/form/Step4Challenge.tsx`**

```tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { step4Schema, type Step4Data } from '@/lib/schemas'
import { CATEGORIES, PROVINCES, URGENCY_LEVELS } from '@/lib/constants'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'

export function Step4Challenge() {
  const t = useTranslations('step4')
  const tc = useTranslations('common')
  const tCat = useTranslations('categories')
  const tProv = useTranslations('provinces')
  const tUrg = useTranslations('urgency')
  const { nextStep, prevStep, setChallenge, formData } = useFormContext()

  const { register, handleSubmit, formState: { errors } } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: formData.challenge ?? {
      challenge_title: '',
      challenge_description: '',
      category: undefined,
      province: undefined,
      urgency: undefined,
      proposed_solution: '',
      background_info: '',
      suits_intl_students: false,
    },
  })

  function onSubmit(data: Step4Data) {
    setChallenge(data)
    nextStep()
  }

  const categoryOptions = CATEGORIES.map((c) => ({ value: c, label: tCat(c) }))
  const provinceOptions = PROVINCES.map((p) => ({ value: p, label: tProv(p) }))
  const urgencyOptions = URGENCY_LEVELS.map((u) => ({ value: u, label: tUrg(u) }))

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="space-y-4">
        <Input
          label={t('challengeTitle')}
          required
          error={errors.challenge_title?.message}
          {...register('challenge_title')}
        />
        <Textarea
          label={t('challengeDescription')}
          required
          hint={t('challengeDescriptionHint')}
          error={errors.challenge_description?.message}
          {...register('challenge_description')}
        />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label={t('category')}
            required
            placeholder={t('selectCategory')}
            options={categoryOptions}
            error={errors.category?.message}
            {...register('category')}
          />
          <Select
            label={t('province')}
            required
            placeholder={t('selectProvince')}
            options={provinceOptions}
            error={errors.province?.message}
            {...register('province')}
          />
          <Select
            label={t('urgency')}
            required
            placeholder={t('selectUrgency')}
            options={urgencyOptions}
            error={errors.urgency?.message}
            {...register('urgency')}
          />
        </div>
        <Textarea
          label={t('proposedSolution')}
          {...register('proposed_solution')}
        />
        <Textarea
          label={t('backgroundInfo')}
          {...register('background_info')}
        />
        <label className="flex items-center gap-3 cursor-pointer">
          <input type="checkbox" className="w-4 h-4 accent-cseri-orange" {...register('suits_intl_students')} />
          <span className="text-sm text-gray-700">{t('suitsIntlStudents')}</span>
        </label>
      </div>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={prevStep}>{tc('back')}</Button>
        <Button type="submit">{tc('next')}</Button>
      </div>
    </form>
  )
}
```

- [ ] **Step 4: Run all tests**

```bash
npx jest
```

Expected: All tests pass.

- [ ] **Step 5: Commit**

```bash
git add components/form/Step4Challenge.tsx __tests__/components/form/Step4Challenge.test.tsx
git commit -m "feat: add Step 4 community challenge details form"
```

---

## Task 14: Step 5 (Confirmation) + Form Page + Confirmation Page

**Files:** `components/form/Step5Confirm.tsx`, `app/[locale]/page.tsx`, `app/[locale]/confirmation/page.tsx`

- [ ] **Step 1: Create `components/form/Step5Confirm.tsx`**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useFormContext } from '@/lib/form-context'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CATEGORIES, PROVINCES, URGENCY_LEVELS } from '@/lib/constants'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red',
  high: 'orange',
  medium: 'blue',
  low: 'gray',
}

export function Step5Confirm() {
  const t = useTranslations('step5')
  const { formData, referenceNo } = useFormContext()

  function handleReset() {
    window.location.reload()
  }

  return (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <span className="text-3xl">✓</span>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-cseri-navy">{t('title')}</h2>
        <p className="text-gray-500 mt-1">{t('subtitle')}</p>
      </div>

      <div className="bg-cseri-navy text-white rounded-xl p-6">
        <p className="text-sm text-blue-200 mb-1">{t('referenceLabel')}</p>
        <p className="text-3xl font-bold tracking-wider">{referenceNo}</p>
      </div>

      {formData.challenge && (
        <div className="bg-gray-50 rounded-lg p-4 text-left space-y-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="navy">{formData.challenge.category}</Badge>
            <Badge variant="navy">{formData.challenge.province}</Badge>
            <Badge variant={URGENCY_BADGE[formData.challenge.urgency] ?? 'gray'}>
              {formData.challenge.urgency}
            </Badge>
          </div>
          <p className="text-sm font-semibold text-gray-800">{formData.challenge.challenge_title}</p>
          <p className="text-sm text-gray-600 line-clamp-3">{formData.challenge.challenge_description}</p>
        </div>
      )}

      <div className="bg-orange-50 border border-cseri-orange/20 rounded-lg p-4 text-left space-y-2">
        <h3 className="font-semibold text-cseri-navy text-sm">{t('summaryTitle')}</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• {t('next1')}</li>
          <li>• {t('next2')}</li>
          <li>• {t('next3')}</li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button variant="outline" disabled title={t('pdfNote')}>
          {t('downloadPdf')}
        </Button>
        <Button onClick={handleReset} variant="secondary">
          {t('newSubmission')}
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create `app/[locale]/page.tsx`**

```tsx
import { useTranslations } from 'next-intl'
import { FormProvider } from '@/lib/form-context'
import { FormWizard } from '@/components/form/FormWizard'

export default function IntakePage() {
  return (
    <FormProvider>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-500">
            Durban University of Technology — Centre for Social Entrepreneurship
          </p>
        </div>
        <FormWizard />
        <p className="text-center text-xs text-gray-400 mt-4">
          Built by Lubelo Tech Solutions
        </p>
      </div>
    </FormProvider>
  )
}
```

- [ ] **Step 3: Verify the app runs**

```bash
npm run dev
```

Open `http://localhost:3000`. It should redirect to `http://localhost:3000/en` and show the 5-step intake form.

Walk through each step manually to verify:
- Step 1: POPIA consent checkbox enables the Next button
- Step 2: Role selection cards highlight on click
- Step 3: Full name validation fires on empty submit
- Step 4: All dropdowns and validation work
- Step 5: Confirmation screen shows reference number

- [ ] **Step 4: Commit**

```bash
git add components/form/Step5Confirm.tsx app/[locale]/page.tsx
git commit -m "feat: add Step 5 confirmation screen and wire up form page"
```

---

## Task 15: Mock Data

**Files:** `lib/mock-data.ts`

- [ ] **Step 1: Create `lib/mock-data.ts`**

```ts
export type Submission = {
  id: string
  reference_no: string
  created_at: string
  role: 'community_member' | 'business_owner' | 'cseri_rep'
  full_name: string
  email: string
  phone: string
  organisation: string
  challenge_title: string
  challenge_description: string
  category: string
  province: string
  urgency: 'low' | 'medium' | 'high' | 'critical'
  proposed_solution: string
  background_info: string
  suits_intl_students: boolean
  language_used: string
  popia_consent: boolean
  status: 'new' | 'reviewing' | 'matched' | 'closed'
}

export const MOCK_SUBMISSIONS: Submission[] = [
  {
    id: '1', reference_no: 'CSERI-2026-00001', created_at: '2026-05-10T08:23:00Z',
    role: 'community_member', full_name: 'Sipho Dlamini', email: 'sipho@gmail.com',
    phone: '071 234 5678', organisation: '',
    challenge_title: 'Lack of clean water access in Umlazi',
    challenge_description: 'Residents in section K of Umlazi have been without running water for 3 months. We rely on a single communal tap shared by over 200 households.',
    category: 'health', province: 'kzn', urgency: 'critical',
    proposed_solution: 'Emergency water tanker deployment and repair of main pipeline',
    background_info: 'The municipality has been notified multiple times with no response.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'new',
  },
  {
    id: '2', reference_no: 'CSERI-2026-00002', created_at: '2026-05-11T10:45:00Z',
    role: 'business_owner', full_name: 'Fatima Moosa', email: 'fatima@moosafashion.co.za',
    phone: '082 345 6789', organisation: 'Moosa Fashion Design',
    challenge_title: 'Digital marketing skills gap for township SMMEs',
    challenge_description: 'Most small businesses in our area cannot afford digital marketing agencies and do not have the skills to market themselves online.',
    category: 'technology', province: 'gp', urgency: 'high',
    proposed_solution: 'Low-cost digital marketing training workshops for SMME owners',
    background_info: 'I have been in business for 5 years and rely entirely on word of mouth.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'reviewing',
  },
  {
    id: '3', reference_no: 'CSERI-2026-00003', created_at: '2026-05-12T14:00:00Z',
    role: 'community_member', full_name: 'Thabo Nkosi', email: '',
    phone: '063 456 7890', organisation: 'Soweto Community Forum',
    challenge_title: 'Youth unemployment in Soweto',
    challenge_description: 'Over 60% of youth aged 18-35 in our ward are unemployed. There are no nearby factories or offices and transportation costs prevent travel to the CBD.',
    category: 'employment', province: 'gp', urgency: 'high',
    proposed_solution: 'Establish a local skills training centre focused on artisan trades',
    background_info: '',
    suits_intl_students: false, language_used: 'zu', popia_consent: true, status: 'matched',
  },
  {
    id: '4', reference_no: 'CSERI-2026-00004', created_at: '2026-05-13T09:15:00Z',
    role: 'business_owner', full_name: 'Maria van der Merwe', email: 'maria@freshproduce.co.za',
    phone: '084 567 8901', organisation: 'Fresh Produce Direct',
    challenge_title: 'Cold chain logistics gap for small-scale farmers',
    challenge_description: 'Small-scale farmers in the Western Cape cannot afford refrigerated transport, causing significant post-harvest losses.',
    category: 'agriculture', province: 'wc', urgency: 'medium',
    proposed_solution: 'Shared refrigerated logistics cooperative for small farmers',
    background_info: 'We lose up to 30% of produce before it reaches markets.',
    suits_intl_students: true, language_used: 'af', popia_consent: true, status: 'reviewing',
  },
  {
    id: '5', reference_no: 'CSERI-2026-00005', created_at: '2026-05-14T11:30:00Z',
    role: 'community_member', full_name: 'Nomvula Sithole', email: 'nomvula.s@yahoo.com',
    phone: '076 678 9012', organisation: '',
    challenge_title: 'No early childhood development centres in rural Limpopo',
    challenge_description: 'Children under 5 in our village have no access to ECD facilities. The nearest centre is 45km away with no public transport.',
    category: 'education', province: 'lp', urgency: 'high',
    proposed_solution: 'Community-run ECD centre using existing church hall',
    background_info: 'The church hall is available and willing to host.',
    suits_intl_students: false, language_used: 'nso', popia_consent: true, status: 'new',
  },
  {
    id: '6', reference_no: 'CSERI-2026-00006', created_at: '2026-05-15T08:00:00Z',
    role: 'business_owner', full_name: 'Lungelo Zulu', email: 'lungelo@zuluconstruct.co.za',
    phone: '071 789 0123', organisation: 'Zulu Construction',
    challenge_title: 'Access to construction contracts for black-owned SMMEs',
    challenge_description: 'Despite BEE legislation, most government construction contracts go to large firms. Small black-owned contractors cannot meet the bonding and insurance requirements.',
    category: 'finance', province: 'kzn', urgency: 'medium',
    proposed_solution: 'Collective bonding scheme for SMME contractors',
    background_info: 'We have the skills but not the capital to qualify for tenders.',
    suits_intl_students: false, language_used: 'en', popia_consent: true, status: 'new',
  },
  {
    id: '7', reference_no: 'CSERI-2026-00007', created_at: '2026-05-16T13:00:00Z',
    role: 'community_member', full_name: 'Priya Naidoo', email: 'priya.naidoo@webmail.co.za',
    phone: '082 890 1234', organisation: 'Phoenix Residents Association',
    challenge_title: 'Flooding of homes in Phoenix after heavy rain',
    challenge_description: 'Approximately 120 homes in Phoenix flood every rainy season due to inadequate stormwater drainage installed in the 1970s.',
    category: 'housing', province: 'kzn', urgency: 'critical',
    proposed_solution: 'Engineering assessment and upgrade of stormwater infrastructure',
    background_info: 'Residents have been raising this with eThekwini Municipality since 2019.',
    suits_intl_students: true, language_used: 'en', popia_consent: true, status: 'reviewing',
  },
  {
    id: '8', reference_no: 'CSERI-2026-00008', created_at: '2026-05-17T10:00:00Z',
    role: 'business_owner', full_name: 'Andile Khumalo', email: 'andile@ecorecycle.co.za',
    phone: '065 901 2345', organisation: 'EcoRecycle SA',
    challenge_title: 'No formal recycling infrastructure in townships',
    challenge_description: 'Township communities generate significant recyclable waste but there is no structured collection. Informal reclaimers work in dangerous conditions.',
    category: 'environment', province: 'ec', urgency: 'low',
    proposed_solution: 'Formalise and support reclaimer cooperatives with collection routes',
    background_info: 'We have piloted this model in 2 streets with positive results.',
    suits_intl_students: true, language_used: 'xh', popia_consent: true, status: 'closed',
  },
]
```

- [ ] **Step 2: Commit**

```bash
git add lib/mock-data.ts
git commit -m "feat: add realistic mock submissions data"
```

---

## Task 16: Admin Login Page

**Files:** `app/admin/login/page.tsx`

- [ ] **Step 1: Create `app/admin/login/page.tsx`**

```tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const DEMO_PASSWORD = 'cseri2026'

export default function AdminLoginPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password === DEMO_PASSWORD) {
      sessionStorage.setItem('cseri_admin', '1')
      router.push('/admin/dashboard')
    } else {
      setError('Incorrect password. Please try again.')
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
            className="w-full bg-cseri-navy text-white py-2.5 rounded-md font-semibold text-sm hover:bg-blue-900 transition-colors"
          >
            Sign In
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

- [ ] **Step 2: Verify admin login works**

```bash
npm run dev
```

Navigate to `http://localhost:3000/admin/login`. Enter `cseri2026` and verify it redirects (dashboard 404 is expected at this point).

- [ ] **Step 3: Commit**

```bash
git add app/admin/login/
git commit -m "feat: add admin login page with mock authentication"
```

---

## Task 17: Admin Dashboard

**Files:** `components/dashboard/StatsCards.tsx`, `components/dashboard/FilterBar.tsx`, `components/dashboard/SubmissionsTable.tsx`, `components/dashboard/SubmissionPanel.tsx`, `app/admin/dashboard/page.tsx`

- [ ] **Step 1: Create `components/dashboard/StatsCards.tsx`**

```tsx
import type { Submission } from '@/lib/mock-data'

interface StatsCardsProps {
  submissions: Submission[]
}

export function StatsCards({ submissions }: StatsCardsProps) {
  const total = submissions.length
  const counts = {
    new: submissions.filter((s) => s.status === 'new').length,
    reviewing: submissions.filter((s) => s.status === 'reviewing').length,
    matched: submissions.filter((s) => s.status === 'matched').length,
    closed: submissions.filter((s) => s.status === 'closed').length,
  }

  const cards = [
    { label: 'Total', value: total, color: 'bg-cseri-navy text-white' },
    { label: 'New', value: counts.new, color: 'bg-cseri-orange text-white' },
    { label: 'Reviewing', value: counts.reviewing, color: 'bg-cseri-blue text-white' },
    { label: 'Matched', value: counts.matched, color: 'bg-green-600 text-white' },
  ]

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(({ label, value, color }) => (
        <div key={label} className={`rounded-xl p-4 ${color}`}>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-3xl font-bold mt-1">{value}</p>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Create `components/dashboard/FilterBar.tsx`**

```tsx
'use client'

import { CATEGORIES, PROVINCES, URGENCY_LEVELS } from '@/lib/constants'

export type Filters = {
  search: string
  category: string
  province: string
  urgency: string
  status: string
}

interface FilterBarProps {
  filters: Filters
  onChange: (filters: Filters) => void
}

export function FilterBar({ filters, onChange }: FilterBarProps) {
  function update(key: keyof Filters, value: string) {
    onChange({ ...filters, [key]: value })
  }

  const inputClass = 'border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-cseri-blue bg-white'

  return (
    <div className="flex flex-wrap gap-3">
      <input
        type="search"
        placeholder="Search reference, name, description..."
        value={filters.search}
        onChange={(e) => update('search', e.target.value)}
        className={`${inputClass} min-w-[220px] flex-1`}
      />
      <select value={filters.category} onChange={(e) => update('category', e.target.value)} className={inputClass}>
        <option value="">All Categories</option>
        {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
      </select>
      <select value={filters.province} onChange={(e) => update('province', e.target.value)} className={inputClass}>
        <option value="">All Provinces</option>
        {PROVINCES.map((p) => <option key={p} value={p}>{p.toUpperCase()}</option>)}
      </select>
      <select value={filters.urgency} onChange={(e) => update('urgency', e.target.value)} className={inputClass}>
        <option value="">All Urgencies</option>
        {URGENCY_LEVELS.map((u) => <option key={u} value={u}>{u}</option>)}
      </select>
      <select value={filters.status} onChange={(e) => update('status', e.target.value)} className={inputClass}>
        <option value="">All Statuses</option>
        {['new', 'reviewing', 'matched', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    </div>
  )
}
```

- [ ] **Step 3: Create `components/dashboard/SubmissionPanel.tsx`**

```tsx
import type { Submission } from '@/lib/mock-data'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red', high: 'orange', medium: 'blue', low: 'gray',
}

interface SubmissionPanelProps {
  submission: Submission | null
  onClose: () => void
}

export function SubmissionPanel({ submission, onClose }: SubmissionPanelProps) {
  if (!submission) return null

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
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create `components/dashboard/SubmissionsTable.tsx`**

```tsx
'use client'

import { useState } from 'react'
import type { Submission } from '@/lib/mock-data'
import type { Filters } from './FilterBar'
import { Badge } from '@/components/ui/Badge'

const URGENCY_BADGE: Record<string, 'red' | 'orange' | 'blue' | 'gray'> = {
  critical: 'red', high: 'orange', medium: 'blue', low: 'gray',
}

interface SubmissionsTableProps {
  submissions: Submission[]
  filters: Filters
  onSelect: (submission: Submission) => void
}

export function SubmissionsTable({ submissions, filters, onSelect }: SubmissionsTableProps) {
  const filtered = submissions.filter((s) => {
    if (filters.category && s.category !== filters.category) return false
    if (filters.province && s.province !== filters.province) return false
    if (filters.urgency && s.urgency !== filters.urgency) return false
    if (filters.status && s.status !== filters.status) return false
    if (filters.search) {
      const q = filters.search.toLowerCase()
      if (
        !s.reference_no.toLowerCase().includes(q) &&
        !s.full_name.toLowerCase().includes(q) &&
        !s.challenge_description.toLowerCase().includes(q) &&
        !s.challenge_title.toLowerCase().includes(q)
      ) return false
    }
    return true
  })

  if (filtered.length === 0) {
    return <p className="text-center text-gray-400 py-12">No submissions match your filters</p>
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
            <th className="px-4 py-3">Reference</th>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Role</th>
            <th className="px-4 py-3">Category</th>
            <th className="px-4 py-3">Province</th>
            <th className="px-4 py-3">Urgency</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {filtered.map((s) => (
            <tr
              key={s.id}
              onClick={() => onSelect(s)}
              className="hover:bg-blue-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs font-semibold text-cseri-navy">{s.reference_no}</td>
              <td className="px-4 py-3 text-gray-500">{new Date(s.created_at).toLocaleDateString()}</td>
              <td className="px-4 py-3 text-gray-600 capitalize">{s.role.replace(/_/g, ' ')}</td>
              <td className="px-4 py-3"><Badge variant="navy">{s.category}</Badge></td>
              <td className="px-4 py-3"><Badge variant="navy">{s.province.toUpperCase()}</Badge></td>
              <td className="px-4 py-3">
                <Badge variant={URGENCY_BADGE[s.urgency] ?? 'gray'}>{s.urgency}</Badge>
              </td>
              <td className="px-4 py-3">
                <Badge variant={s.status === 'matched' ? 'green' : s.status === 'closed' ? 'gray' : 'blue'}>
                  {s.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 5: Create `app/admin/dashboard/page.tsx`**

```tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MOCK_SUBMISSIONS, type Submission } from '@/lib/mock-data'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { FilterBar, type Filters } from '@/components/dashboard/FilterBar'
import { SubmissionsTable } from '@/components/dashboard/SubmissionsTable'
import { SubmissionPanel } from '@/components/dashboard/SubmissionPanel'

export default function DashboardPage() {
  const router = useRouter()
  const [selected, setSelected] = useState<Submission | null>(null)
  const [filters, setFilters] = useState<Filters>({
    search: '', category: '', province: '', urgency: '', status: '',
  })

  useEffect(() => {
    if (typeof window !== 'undefined' && !sessionStorage.getItem('cseri_admin')) {
      router.replace('/admin/login')
    }
  }, [router])

  function handleLogout() {
    sessionStorage.removeItem('cseri_admin')
    router.push('/admin/login')
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
        <StatsCards submissions={MOCK_SUBMISSIONS} />
        <FilterBar filters={filters} onChange={setFilters} />
        <SubmissionsTable
          submissions={MOCK_SUBMISSIONS}
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
          <SubmissionPanel submission={selected} onClose={() => setSelected(null)} />
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 6: Run full test suite**

```bash
npx jest
```

Expected: All tests pass.

- [ ] **Step 7: Verify dashboard end-to-end**

```bash
npm run dev
```

1. Go to `http://localhost:3000/admin/login`, enter `cseri2026`
2. Verify redirect to dashboard with 8 mock submissions visible
3. Verify stat cards show correct counts (Total: 8, New: 3, Reviewing: 3, Matched: 1)
4. Click a row → verify side panel slides open with full details
5. Test each filter dropdown and search box
6. Click outside panel → verify it closes

- [ ] **Step 8: Build check**

```bash
npm run build
```

Expected: Build succeeds with no errors.

- [ ] **Step 9: Commit**

```bash
git add components/dashboard/ app/admin/dashboard/
git commit -m "feat: add admin dashboard with stats, filters, table, and detail panel"
```

---

## Self-Review Checklist

- [x] All spec requirements covered: 5-step form, 11 languages, POPIA consent, role selection, contact, challenge, confirmation, admin login, admin dashboard with filters and detail panel
- [x] No TBD or placeholder steps — every step has actual code
- [x] Type names consistent across tasks: `Submission`, `Step3Data`, `Step4Data`, `Filters`, `FormData`, `Role`
- [x] Method names consistent: `nextStep`, `prevStep`, `setConsent`, `setRole`, `setContact`, `setChallenge` used identically in context and step components
- [x] All imports match files defined in the file map
- [x] Demo password `cseri2026` documented in Task 16

---

**Plan complete.** Two execution options:

**1. Subagent-Driven (recommended)** — Fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** — Execute tasks in this session using executing-plans, batch execution with checkpoints

Which approach?
