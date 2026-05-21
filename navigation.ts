import { createNavigation } from 'next-intl/navigation'

export const locales = [
  'en', 'af', 'zu', 'xh', 'st', 'tn', 'nso', 'ts', 'ss', 've', 'nr',
] as const

export type Locale = (typeof locales)[number]

export const { Link, redirect, usePathname, useRouter } =
  createNavigation({ locales })
