import type { Application } from '@/features/applications/types'

let counter = 0

export function makeApplication(overrides: Partial<Application> = {}): Application {
  counter += 1
  const now = new Date('2026-05-01T10:00:00.000Z').toISOString()
  return {
    id: `test-id-${counter}`,
    company: 'Acme Corp',
    position: 'Senior Frontend Developer',
    status: 'applied',
    appliedAt: now,
    createdAt: now,
    updatedAt: now,
    ...overrides,
  }
}

export function resetMakeApplication(): void {
  counter = 0
}
