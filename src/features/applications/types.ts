export const APPLICATION_STATUSES = [
  'wishlist',
  'applied',
  'screening',
  'tech_interview',
  'final_interview',
  'offer',
  'rejected',
  'withdrawn',
] as const

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const
export type WorkMode = (typeof WORK_MODES)[number]

export const CURRENCIES = ['EUR', 'PLN', 'USD'] as const
export type Currency = (typeof CURRENCIES)[number]

export interface Salary {
  min?: number
  max?: number
  currency: Currency
}

export interface Application {
  id: string
  company: string
  position: string
  status: ApplicationStatus
  appliedAt: string
  url?: string
  location?: string
  workMode?: WorkMode
  salary?: Salary
  techStack?: string[]
  notes?: string
  contactName?: string
  contactEmail?: string
  tags?: string[]
  createdAt: string
  updatedAt: string
}

export type ApplicationDraft = Omit<Application, 'id' | 'status' | 'createdAt' | 'updatedAt'> & {
  status?: ApplicationStatus
}

export const APPLICATION_EVENT_TYPES = [
  'created',
  'status_change',
  'note',
  'interview_scheduled',
  'email',
] as const

export type ApplicationEventType = (typeof APPLICATION_EVENT_TYPES)[number]

export interface ApplicationEvent {
  id: string
  applicationId: string
  date: string
  type: ApplicationEventType
  description: string
  metadata?: Record<string, unknown>
}

export type ApplicationEventDraft = Omit<ApplicationEvent, 'id' | 'date'> & {
  date?: string
}

export interface FilterState {
  search: string
  statuses: ApplicationStatus[]
  dateFrom?: string
  dateTo?: string
  techStack?: string[]
}
