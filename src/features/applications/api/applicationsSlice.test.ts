import { describe, it, expect, beforeEach } from 'vitest'
import {
  applicationsReducer,
  applicationAdded,
  applicationUpdated,
  applicationDeleted,
  applicationStatusChanged,
  applicationsReplaced,
  selectApplicationsCountByStatus,
  selectApplicationsByStatus,
  selectTotalApplications,
} from './applicationsSlice'
import { eventsReducer } from './eventsSlice'
import { makeApplication, resetMakeApplication } from '@/test/fixtures/applications'
import type { RootState } from '@/app/store'

const initial = applicationsReducer(undefined, { type: '@@INIT' })

function makeState(overrides?: Parameters<typeof applicationsReplaced>[0]): RootState {
  return {
    applications: overrides
      ? applicationsReducer(initial, applicationsReplaced(overrides))
      : initial,
    events: eventsReducer(undefined, { type: '@@INIT' }),
  } as unknown as RootState
}

beforeEach(() => resetMakeApplication())

describe('applicationsSlice', () => {
  describe('applicationAdded', () => {
    it('adds an application with default status=wishlist', () => {
      const next = applicationsReducer(
        initial,
        applicationAdded({ company: 'Acme', position: 'FE', appliedAt: '2026-05-01' }),
      )
      expect(next.ids).toHaveLength(1)
      const app = next.entities[next.ids[0]!]
      expect(app?.status).toBe('wishlist')
    })

    it('respects status when provided', () => {
      const next = applicationsReducer(
        initial,
        applicationAdded({
          company: 'Acme',
          position: 'FE',
          appliedAt: '2026-05-01',
          status: 'applied',
        }),
      )
      const app = next.entities[next.ids[0]!]
      expect(app?.status).toBe('applied')
    })

    it('generates a non-empty id', () => {
      const next = applicationsReducer(
        initial,
        applicationAdded({ company: 'A', position: 'p', appliedAt: 'd' }),
      )
      expect(next.ids[0]).toBeTruthy()
    })

    it('generates unique ids for different applications', () => {
      const s1 = applicationsReducer(
        initial,
        applicationAdded({ company: 'A', position: 'p', appliedAt: 'd' }),
      )
      const s2 = applicationsReducer(
        s1,
        applicationAdded({ company: 'B', position: 'p', appliedAt: 'd' }),
      )
      expect(s2.ids).toHaveLength(2)
      expect(s2.ids[0]).not.toEqual(s2.ids[1])
    })

    it('sets createdAt equal to updatedAt on creation', () => {
      const next = applicationsReducer(
        initial,
        applicationAdded({ company: 'A', position: 'p', appliedAt: 'd' }),
      )
      const app = next.entities[next.ids[0]!]
      expect(app?.createdAt).toBe(app?.updatedAt)
    })
  })

  describe('applicationUpdated', () => {
    it('patches changes and bumps updatedAt, keeps createdAt', () => {
      const seed = makeApplication({ id: 'a1', company: 'Old' })
      const state = applicationsReducer(initial, applicationsReplaced([seed]))
      const next = applicationsReducer(
        state,
        applicationUpdated({ id: 'a1', changes: { company: 'New' } }),
      )
      expect(next.entities['a1']?.company).toBe('New')
      expect(next.entities['a1']?.createdAt).toBe(seed.createdAt)
      expect(next.entities['a1']?.updatedAt).not.toBe(seed.updatedAt)
    })

    it('is a no-op for an unknown id', () => {
      const next = applicationsReducer(
        initial,
        applicationUpdated({ id: 'nope', changes: { company: 'X' } }),
      )
      expect(next.ids).toHaveLength(0)
    })
  })

  describe('applicationDeleted', () => {
    it('removes the target and keeps the rest', () => {
      const a = makeApplication({ id: 'a1' })
      const b = makeApplication({ id: 'a2' })
      const state = applicationsReducer(initial, applicationsReplaced([a, b]))
      const next = applicationsReducer(state, applicationDeleted('a1'))
      expect(next.ids).not.toContain('a1')
      expect(next.ids).toContain('a2')
    })
  })

  describe('applicationStatusChanged', () => {
    it('changes status and bumps updatedAt', () => {
      const seed = makeApplication({ id: 'a1', status: 'applied' })
      const state = applicationsReducer(initial, applicationsReplaced([seed]))
      const next = applicationsReducer(
        state,
        applicationStatusChanged({ id: 'a1', status: 'tech_interview' }),
      )
      expect(next.entities['a1']?.status).toBe('tech_interview')
      expect(next.entities['a1']?.updatedAt).not.toBe(seed.updatedAt)
    })
  })

  describe('applicationsReplaced', () => {
    it('replaces all existing applications', () => {
      const preloaded = applicationsReducer(
        initial,
        applicationsReplaced([makeApplication({ id: 'old' })]),
      )
      const next = applicationsReducer(
        preloaded,
        applicationsReplaced([makeApplication({ id: 'new1' }), makeApplication({ id: 'new2' })]),
      )
      expect(next.ids).toEqual(expect.arrayContaining(['new1', 'new2']))
      expect(next.ids).not.toContain('old')
    })
  })
})

describe('selectors', () => {
  it('selectTotalApplications returns correct count', () => {
    const state = makeState([makeApplication(), makeApplication()])
    expect(selectTotalApplications(state)).toBe(2)
  })

  it('selectApplicationsByStatus filters by status', () => {
    const state = makeState([
      makeApplication({ id: 'a1', status: 'applied' }),
      makeApplication({ id: 'a2', status: 'offer' }),
      makeApplication({ id: 'a3', status: 'applied' }),
    ])
    const result = selectApplicationsByStatus(state, 'applied')
    expect(result).toHaveLength(2)
    expect(result.every((a) => a.status === 'applied')).toBe(true)
  })

  it('selectApplicationsCountByStatus counts each status', () => {
    const state = makeState([
      makeApplication({ status: 'applied' }),
      makeApplication({ status: 'applied' }),
      makeApplication({ status: 'offer' }),
    ])
    const counts = selectApplicationsCountByStatus(state)
    expect(counts.applied).toBe(2)
    expect(counts.offer).toBe(1)
    expect(counts.rejected).toBe(0)
  })

  it('selectApplicationsCountByStatus initialises every status key', () => {
    const counts = selectApplicationsCountByStatus(makeState())
    const keys = Object.keys(counts)
    expect(keys).toContain('wishlist')
    expect(keys).toContain('withdrawn')
    expect(keys).toHaveLength(8)
  })
})
