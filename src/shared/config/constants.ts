import type { ApplicationStatus } from '@/features/applications/types'

export const STATUS_LABELS: Record<ApplicationStatus, string> = {
  wishlist: 'Wishlist',
  applied: 'Applied',
  screening: 'Screening',
  tech_interview: 'Tech interview',
  final_interview: 'Final',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
}

export const STATUS_ORDER: readonly ApplicationStatus[] = [
  'wishlist',
  'applied',
  'screening',
  'tech_interview',
  'final_interview',
  'offer',
  'rejected',
  'withdrawn',
]

export const STORAGE_KEY = 'job-hunt-tracker'
export const STORAGE_VERSION = 1
