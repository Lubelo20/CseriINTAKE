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
