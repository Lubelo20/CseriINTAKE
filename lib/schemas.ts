import { z } from 'zod'
import { CATEGORIES, PROVINCES, URGENCY_LEVELS, ROLES } from './constants'

export const step2Schema = z.object({
  role: z.enum(ROLES),
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
  category: z.enum(CATEGORIES),
  province: z.enum(PROVINCES),
  urgency: z.enum(URGENCY_LEVELS),
  proposed_solution: z.string().optional().default(''),
  background_info: z.string().optional().default(''),
  suits_intl_students: z.boolean().default(false),
})

export type Step2Data = z.infer<typeof step2Schema>
export type Step3Data = z.infer<typeof step3Schema>
export type Step4Data = z.infer<typeof step4Schema>
