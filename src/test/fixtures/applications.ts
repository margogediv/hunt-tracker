import type { Application } from '../../features/applications/types'

export const mockApplication: Application = {
  id: 'test-1',
  company: 'Acme Corp',
  position: 'Frontend Developer',
  status: 'applied',
  appliedAt: '2026-04-15',
  events: [],
  createdAt: '2026-04-15T10:00:00.000Z',
  updatedAt: '2026-04-15T10:00:00.000Z',
}

export const mockApplications: Application[] = [
  mockApplication,
  {
    id: 'test-2',
    company: 'TechStart',
    position: 'React Developer',
    status: 'screening',
    appliedAt: '2026-04-20',
    techStack: ['React', 'TypeScript'],
    events: [],
    createdAt: '2026-04-20T09:00:00.000Z',
    updatedAt: '2026-04-21T14:00:00.000Z',
  },
]
