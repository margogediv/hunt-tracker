import { describe, it, expect } from 'vitest'
import {
  eventsReducer,
  eventAdded,
  eventsForApplicationDeleted,
  eventsReplaced,
  selectEventsByApplicationId,
} from './eventsSlice'
import { applicationsReducer } from './applicationsSlice'
import type { RootState } from '@/app/store'

const initial = eventsReducer(undefined, { type: '@@INIT' })

function makeState(events: Parameters<typeof eventsReplaced>[0]): RootState {
  return {
    applications: applicationsReducer(undefined, { type: '@@INIT' }),
    events: eventsReducer(initial, eventsReplaced(events)),
  } as unknown as RootState
}

describe('eventsSlice', () => {
  describe('eventAdded', () => {
    it('generates a non-empty id', () => {
      const next = eventsReducer(
        initial,
        eventAdded({ applicationId: 'a1', type: 'note', description: 'Hi' }),
      )
      expect(next.ids).toHaveLength(1)
      expect(next.ids[0]).toBeTruthy()
    })

    it('uses provided date when given', () => {
      const date = '2026-01-01T00:00:00.000Z'
      const next = eventsReducer(
        initial,
        eventAdded({ applicationId: 'a1', type: 'note', description: 'Hi', date }),
      )
      const event = next.entities[next.ids[0]!]
      expect(event?.date).toBe(date)
    })

    it('defaults date to a valid ISO string when omitted', () => {
      const next = eventsReducer(
        initial,
        eventAdded({ applicationId: 'a1', type: 'note', description: 'Hi' }),
      )
      const event = next.entities[next.ids[0]!]
      expect(new Date(event!.date).toISOString()).toBe(event!.date)
    })
  })

  describe('eventsForApplicationDeleted', () => {
    it('removes only events for the given applicationId', () => {
      const state = eventsReducer(
        initial,
        eventsReplaced([
          { id: 'e1', applicationId: 'a1', type: 'note', description: 'A', date: '2026-01-01' },
          { id: 'e2', applicationId: 'a1', type: 'note', description: 'B', date: '2026-01-02' },
          { id: 'e3', applicationId: 'a2', type: 'note', description: 'C', date: '2026-01-03' },
        ]),
      )
      const next = eventsReducer(state, eventsForApplicationDeleted('a1'))
      expect(next.ids).not.toContain('e1')
      expect(next.ids).not.toContain('e2')
      expect(next.ids).toContain('e3')
    })

    it('is a no-op when applicationId has no events', () => {
      const state = eventsReducer(
        initial,
        eventsReplaced([
          { id: 'e1', applicationId: 'a1', type: 'note', description: 'A', date: '2026-01-01' },
        ]),
      )
      const next = eventsReducer(state, eventsForApplicationDeleted('a2'))
      expect(next.ids).toEqual(['e1'])
    })
  })
})

describe('selectEventsByApplicationId', () => {
  it('returns only events for the given applicationId', () => {
    const state = makeState([
      { id: 'e1', applicationId: 'a1', type: 'note', description: 'A', date: '2026-01-01' },
      { id: 'e2', applicationId: 'a2', type: 'note', description: 'B', date: '2026-01-02' },
    ])
    const result = selectEventsByApplicationId(state, 'a1')
    expect(result).toHaveLength(1)
    expect(result[0]?.id).toBe('e1')
  })

  it('returns events sorted ascending by date', () => {
    const state = makeState([
      { id: 'e1', applicationId: 'a1', type: 'note', description: 'A', date: '2026-03-01' },
      { id: 'e2', applicationId: 'a1', type: 'note', description: 'B', date: '2026-01-01' },
      { id: 'e3', applicationId: 'a1', type: 'note', description: 'C', date: '2026-02-01' },
    ])
    const result = selectEventsByApplicationId(state, 'a1')
    expect(result.map((e) => e.id)).toEqual(['e2', 'e3', 'e1'])
  })

  it('returns empty array when applicationId has no events', () => {
    const state = makeState([])
    expect(selectEventsByApplicationId(state, 'a1')).toEqual([])
  })
})
