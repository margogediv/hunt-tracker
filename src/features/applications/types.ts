export type ApplicationStatus =
  | 'wishlist'
  | 'applied'
  | 'screening'
  | 'tech_interview'
  | 'final_interview'
  | 'offer'
  | 'rejected'
  | 'withdrawn'

export type WorkMode = 'onsite' | 'hybrid' | 'remote'

export interface Application {
  id: string
  company: string
  position: string
  status: ApplicationStatus
  appliedAt: string
  url?: string
  location?: string
  workMode?: WorkMode
  salary?: {
    min?: number
    max?: number
    currency: 'EUR' | 'PLN' | 'USD'
  }
  techStack?: string[]
  notes?: string
  contactName?: string
  contactEmail?: string
  tags?: string[]
  events: ApplicationEvent[]
  createdAt: string
  updatedAt: string
}

export interface ApplicationEvent {
  id: string
  applicationId: string
  date: string
  type: 'status_change' | 'note' | 'interview_scheduled' | 'email'
  description: string
  metadata?: Record<string, unknown>
}

export interface FilterState {
  search: string
  statuses: ApplicationStatus[]
  dateFrom?: string
  dateTo?: string
  techStack?: string[]
}
